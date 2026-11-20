import SwiftUI

/// Aiguille entre Login et l'accueil selon la session. Une session invalide ou expirée
/// repasse l'état à `.signedOut` et renvoie donc vers Login.
struct ContentView: View {
    @State private var auth = AuthStore(api: URLSessionAuthAPI())

    var body: some View {
        Group {
            switch auth.state {
            case .unknown:
                ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity).background(Theme.bg)
            case .signedOut:
                NavigationStack { LoginView() }
            case .signedIn:
                HomeView(api: URLSessionEventsAPI())
            }
        }
        .environment(auth)
        .task { await auth.restore() }
    }
}

#Preview { ContentView() }
