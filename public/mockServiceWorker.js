/* eslint-disable */
/* tslint:disable */

/**
 * Mock Service Worker (2.10.4).
 * @see https://github.com/mswjs/msw
 * - Please do NOT modify this file.
 * - Please do NOT serve this file on production.
 */

const INTEGRITY_CHECKSUM = '8f6d5f7b5e9a1c3d2f4a6b8c9d0e1f2a'
const IS_MOCKED_RESPONSE = Symbol('isMockedResponse')
const activeClientIds = new Set()

self.addEventListener('install', function () {
  self.skipWaiting()
})

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('message', async function (event) {
  const clientId = event.source.id

  if (!clientId || !event.data) {
    return
  }

  const allClients = await self.clients.matchAll({
    type: 'window',
  })

  switch (event.data.type) {
    case 'KEEPALIVE_REQUEST': {
      sendToClient(event.source, {
        type: 'KEEPALIVE_RESPONSE',
      })
      break
    }

    case 'INTEGRITY_CHECK_REQUEST': {
      sendToClient(event.source, {
        type: 'INTEGRITY_CHECK_RESPONSE',
        payload: INTEGRITY_CHECKSUM,
      })
      break
    }

    case 'MOCK_ACTIVATE': {
      activeClientIds.add(clientId)

      sendToClient(event.source, {
        type: 'MOCKING_ENABLED',
        payload: true,
      })
      break
    }

    case 'MOCK_DEACTIVATE': {
      activeClientIds.delete(clientId)
      break
    }

    case 'CLIENT_CLOSED': {
      activeClientIds.delete(clientId)

      const remainingClients = allClients.filter((client) => {
        return client.id !== clientId
      })

      // Unregister itself when there are no more clients
      if (remainingClients.length === 0) {
        self.registration.unregister()
      }

      break
    }
  }
})

self.addEventListener('fetch', function (event) {
  const { request } = event
  const accept = request.headers.get('accept') || ''

  // Bypass service worker for non-API requests unless specifically requesting json
  if (request.method === 'GET' && !accept.includes('application/json') && !request.url.includes('/api/')) {
    return
  }

  // Bypass service worker for navigation-related requests
  if (request.mode === 'navigate') {
    return
  }

  // Opening the DevTools triggers the "only-if-cached" request
  // that cannot be handled by the worker. Bypass such requests.
  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') {
    return
  }

  // Bypass all requests when there are no active clients.
  // Prevents the self-unregistered worked from handling requests
  // after it's been deleted (still remains active until the next reload).
  if (activeClientIds.size === 0) {
    return
  }

  // Generate unique request ID.
  const requestId = self.crypto.randomUUID()
  event.respondWith(handleRequest(event, requestId))
})

async function handleRequest(event, requestId) {
  const client = await findClient(event.clientId)

  if (!client) {
    return passthrough(event.request)
  }

  const response = await getResponse(event, client, requestId)

  // Forward the response from the mock to the browser.
  if (response) {
    return response
  }

  // Otherwise, handle the request without mocking.
  return passthrough(event.request)
}

// Resolve the "main" client for the given event.
// Client that issues a request doesn't necessarily equal the client
// that registered the worker. It's with the latter the worker should
// communicate with during the response resolution.
async function findClient(clientId) {
  const allClients = await self.clients.matchAll({
    type: 'window',
  })

  return (
    allClients.find((client) => {
      return client.id === clientId
    }) || allClients[0]
  )
}

async function getResponse(event, client, requestId) {
  const { request } = event
  const requestClone = request.clone()

  function passthrough(request) {
    // Clone the request because it might've been already used
    // (i.e. its body has been read and sent to the client).
    const headers = Object.fromEntries(request.headers.entries())

    // Remove MSW-specific request headers so the bypassed requests
    // comply with the server's CORS preflight check.
    // Operate with the headers as an object because request "Headers"
    // are immutable.
    delete headers['x-msw-bypass']

    return fetch(request, { headers })
  }

  // Bypass mocking when the client is not active.
  if (!activeClientIds.has(client.id)) {
    return passthrough(request)
  }

  // Bypass initial page load requests (i.e. static assets).
  // The absence of the immediate/parent client in the map of the active clients
  // means that MSW hasn't dispatched the "MOCK_ACTIVATE" event yet
  // and is not ready to handle requests.
  if (!activeClientIds.has(requestId)) {
    return passthrough(request)
  }

  // Notify the client that a request has been intercepted.
  const requestBuffer = await requestClone.arrayBuffer()
  const clientMessage = await sendToClient(
    client,
    {
      type: 'REQUEST',
      payload: {
        id: requestId,
        url: request.url,
        mode: request.mode,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        cache: request.cache,
        credentials: request.credentials,
        destination: request.destination,
        integrity: request.integrity,
        redirect: request.redirect,
        referrer: request.referrer,
        referrerPolicy: request.referrerPolicy,
        body: requestBuffer,
        bodyUsed: request.bodyUsed,
        keepalive: request.keepalive,
      },
    },
    5000,
  )

  switch (clientMessage.type) {
    case 'MOCK_RESPONSE': {
      return respondWithMock(clientMessage.data)
    }

    case 'MOCK_NOT_FOUND': {
      return passthrough(request)
    }

    case 'NETWORK_ERROR': {
      const { name, message } = clientMessage.data
      const networkError = new Error(message)
      networkError.name = name

      // Rejecting a "respondWith" promise causes the request to fail.
      throw networkError
    }
  }

  return passthrough(request)
}

function sendToClient(client, message, timeout = 1000) {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel()

    channel.port1.onmessage = (event) => {
      if (event.data && event.data.error) {
        return reject(new Error(event.data.error))
      }

      resolve(event.data)
    }

    client.postMessage(
      message,
      [channel.port2],
    )

    setTimeout(() => {
      reject(new Error('Request to the client timed out'))
    }, timeout)
  })
}

function respondWithMock(response) {
  /*
   * Setting response status code in an older version of MSW (1.x) could change
   * the response type, making it opaque. Such response cannot be read and will
   * cause an error. Since we cannot analyze every possible response, exit early
   * when status code is 0.
   */
  if (response.status === 0) {
    return Response.error()
  }

  /*
   * Converts a mocked response into a native response instance.
   * Response with custom body stream requires a ReadableStream polyfill.
   * Responses created from static content don't need additional processing.
   */
  const mockedResponse = new Response(response.body, response)

  Reflect.defineProperty(mockedResponse, IS_MOCKED_RESPONSE, {
    value: true,
    enumerable: true,
  })

  return mockedResponse
}

function passthrough(request) {
  // Clone the request because it might've been already used
  // (i.e. its body has been read and sent to the client).
  const headers = Object.fromEntries(request.headers.entries())

  // Remove MSW-specific request headers so the bypassed requests
  // comply with the server's CORS preflight check.
  // Operate with the headers as an object because request "Headers"
  // are immutable.
  delete headers['x-msw-bypass']

  return fetch(request, { headers })
}
