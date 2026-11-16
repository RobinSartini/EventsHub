import Foundation

/// Reflète le schéma `Event` de contrat/openapi.yaml (champs utiles à l'accueil).
struct Event: Identifiable, Equatable, Decodable, Sendable {
    let id: String
    let name: String
    let startDate: Date
    let location: String?
    let capacity: Int?
    let status: String?
}
