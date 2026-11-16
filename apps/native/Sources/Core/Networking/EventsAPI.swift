import Foundation

/// GET /events — public : aucun paramètre d'authentification.
protocol EventsAPI: Sendable {
    func fetchEvents() async throws -> [Event]
}
