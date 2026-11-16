import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack(spacing: 12) {
            Text("Lancement de projet").font(.caption.monospaced().bold()).foregroundStyle(.purple)
            Text("EventsHub").font(.largeTitle.bold())
            Text("SwiftUI is ready for iPhone and iPad.").foregroundStyle(.secondary)
            Text("Version 1.0.0").font(.caption.monospaced().bold())
        }
        .padding(24)
    }
}

#Preview { ContentView() }
