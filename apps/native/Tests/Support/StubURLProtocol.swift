import Foundation
@testable import EventsHub

/// Faux réseau partagé : `URLProtocol` qui renvoie une réponse fixée, sans serveur.
/// État statique : toutes les suites réseau vivent sous `Networking` (`.serialized`).
final class StubURLProtocol: URLProtocol, @unchecked Sendable {
    nonisolated(unsafe) static var status = 200
    nonisolated(unsafe) static var body = Data()
    nonisolated(unsafe) static var error: URLError?
    nonisolated(unsafe) static var lastRequest: URLRequest?

    override class func canInit(with request: URLRequest) -> Bool { true }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }

    override func startLoading() {
        Self.lastRequest = request
        if let error = Self.error {
            client?.urlProtocol(self, didFailWithError: error)
            return
        }
        let response = HTTPURLResponse(url: request.url!, statusCode: Self.status, httpVersion: nil, headerFields: nil)!
        client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
        client?.urlProtocol(self, didLoad: Self.body)
        client?.urlProtocolDidFinishLoading(self)
    }

    override func stopLoading() {}
}

/// Client branché sur le stub.
func makeStubClient(
    status: Int = 200, body: String = "{}", error: URLError? = nil, baseURL: URL? = URL(string: "http://test.local"),
    origin: String? = "http://app.test"
) -> APIClient {
    StubURLProtocol.status = status
    StubURLProtocol.body = Data(body.utf8)
    StubURLProtocol.error = error
    let config = URLSessionConfiguration.ephemeral
    config.protocolClasses = [StubURLProtocol.self]
    return APIClient(baseURL: baseURL, origin: origin, session: URLSession(configuration: config))
}

/// Parent `.serialized` : les suites imbriquées ne tournent jamais en parallèle.
import Testing
@Suite(.serialized) enum Networking {}
