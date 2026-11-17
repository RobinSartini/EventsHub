import Foundation
import Testing
@testable import EventsHub

private struct Item: Decodable, Equatable {
    let name: String
    let at: Date
}

private func expectError(_ expected: APIError, _ call: () async throws -> Void) async {
    do {
        try await call()
        Issue.record("Aucune erreur levée, attendu \(expected)")
    } catch {
        #expect(error as? APIError == expected)
    }
}

extension Networking {
@Suite struct APIClientTests {
    @Test func getDecodesBodyAndBuildsURL() async throws {
        let client = makeStubClient(body: #"{"name":"a","at":"2026-11-16T10:00:00.000Z"}"#)
        let item: Item = try await client.send("GET", path: "items")
        #expect(item.name == "a")
        #expect(StubURLProtocol.lastRequest?.httpMethod == "GET")
        #expect(StubURLProtocol.lastRequest?.url?.path == "/items")
    }

    @Test func decodesDatesWithAndWithoutFractions() async throws {
        let withFraction: Item = try await makeStubClient(body: #"{"name":"a","at":"2026-11-16T10:00:00.500Z"}"#).send("GET", path: "i")
        let plain: Item = try await makeStubClient(body: #"{"name":"a","at":"2026-11-16T10:00:00Z"}"#).send("GET", path: "i")
        #expect(withFraction.at.timeIntervalSince(plain.at) == 0.5)
    }

    @Test func postSendsJSONBody() async throws {
        let client = makeStubClient(body: #"{"name":"a","at":"2026-11-16T10:00:00Z"}"#)
        let _: Item = try await client.send("POST", path: "items", body: ["k": "v"])
        let request = try #require(StubURLProtocol.lastRequest)
        #expect(request.httpMethod == "POST")
        #expect(request.value(forHTTPHeaderField: "Content-Type") == "application/json")
    }

    @Test func getSendsConfiguredOrigin() async throws {
        let client = makeStubClient(body: #"{"name":"a","at":"2026-11-16T10:00:00Z"}"#, origin: "http://localhost:3000")
        let _: Item = try await client.send("GET", path: "items")
        #expect(StubURLProtocol.lastRequest?.value(forHTTPHeaderField: "Origin") == "http://localhost:3000")
    }

    @Test func postSendsConfiguredOrigin() async throws {
        let client = makeStubClient(body: #"{"name":"a","at":"2026-11-16T10:00:00Z"}"#, origin: "http://localhost:3000")
        let _: Item = try await client.send("POST", path: "items", body: ["k": "v"])
        #expect(StubURLProtocol.lastRequest?.value(forHTTPHeaderField: "Origin") == "http://localhost:3000")
    }

    @Test func nilOriginSendsNoOriginHeader() async throws {
        let client = makeStubClient(body: #"{"name":"a","at":"2026-11-16T10:00:00Z"}"#, origin: nil)
        let _: Item = try await client.send("GET", path: "items")
        #expect(StubURLProtocol.lastRequest?.value(forHTTPHeaderField: "Origin") == nil)
    }

    @Test func emptyOriginSendsNoOriginHeader() async throws {
        let client = makeStubClient(body: #"{"name":"a","at":"2026-11-16T10:00:00Z"}"#, origin: "")
        let _: Item = try await client.send("GET", path: "items")
        #expect(StubURLProtocol.lastRequest?.value(forHTTPHeaderField: "Origin") == nil)
    }

    @Test func status400IsBadRequest() async {
        let client = makeStubClient(status: 400)
        await expectError(.badRequest) { let _: Item = try await client.send("GET", path: "i") }
    }

    @Test func status401IsUnauthorized() async {
        let client = makeStubClient(status: 401)
        await expectError(.unauthorized) { let _: Item = try await client.send("GET", path: "i") }
    }

    @Test func status403IsForbidden() async {
        let client = makeStubClient(status: 403)
        await expectError(.forbidden) { let _: Item = try await client.send("GET", path: "i") }
    }

    @Test func status422IsUnprocessable() async {
        let client = makeStubClient(status: 422)
        await expectError(.unprocessable) { let _: Item = try await client.send("GET", path: "i") }
    }

    @Test func status500IsServer() async {
        let client = makeStubClient(status: 500)
        await expectError(.server) { let _: Item = try await client.send("GET", path: "i") }
    }

    @Test func nilBaseURLIsInvalidURL() async {
        let client = makeStubClient(baseURL: nil)
        await expectError(.invalidURL) { let _: Item = try await client.send("GET", path: "i") }
    }

    @Test func transportFailureIsNetwork() async {
        let client = makeStubClient(error: URLError(.notConnectedToInternet))
        await expectError(.network) { let _: Item = try await client.send("GET", path: "i") }
    }

    @Test func malformedBodyIsDecoding() async {
        let client = makeStubClient(body: "{pas du json")
        await expectError(.decoding) { let _: Item = try await client.send("GET", path: "i") }
    }

    @Test func everyErrorHasLocalizedDescription() {
        let all: [APIError] = [.invalidURL, .network, .badRequest, .unauthorized, .forbidden, .unprocessable, .server, .decoding]
        for error in all {
            #expect(error.errorDescription?.isEmpty == false)
        }
    }

    @Test func cancellationIsNotMappedToNetwork() async {
        let client = makeStubClient(error: URLError(.cancelled))
        do {
            let _: Item = try await client.send("GET", path: "i")
            Issue.record("Aucune erreur levée")
        } catch {
            #expect((error as? URLError)?.code == .cancelled)
            #expect(error as? APIError == nil)
        }
    }

    @Test func encodingFailureIsBadRequest() async {
        struct Bad: Encodable {
            func encode(to encoder: Encoder) throws {
                throw EncodingError.invalidValue(0, .init(codingPath: [], debugDescription: "x"))
            }
        }
        let client = makeStubClient()
        await expectError(.badRequest) { let _: Item = try await client.send("POST", path: "i", body: Bad()) }
    }
}
}
