import SwiftUI
import UIKit

/// Palette « Riviera » de la maquette (clair / sombre).
enum Theme {
    static let bg = Color(light: 0xF6F8FD, dark: 0x070B1A)
    static let surface = Color(light: 0xFFFFFF, dark: 0x10172E)
    static let border = Color(light: 0xD3DBEC, dark: 0x26315A)
    static let text = Color(light: 0x0B1533, dark: 0xF3F5FC)
    static let muted = Color(light: 0x4D5878, dark: 0xA3ADCB)
    static let primary = Color(light: 0x1D3FD8, dark: 0x7D9BFF)
    static let onPrimary = Color(light: 0xFFFFFF, dark: 0x070B1A)
    static let accent = Color(light: 0xE1213A, dark: 0xFF5468)
    static let accentText = Color(light: 0xC21A30, dark: 0xFF5468)
    static let primarySoft = Color(light: 0xD9E1FF, dark: 0x1A2A6E)
    static let accentSoft = Color(light: 0xFFD9DE, dark: 0x4A121C)
    static let sky = Color(light: 0xC7ECFF, dark: 0x0E3550)
}

extension Color {
    init(light: UInt, dark: UInt) {
        self.init(uiColor: UIColor { traits in
            UIColor(hex: traits.userInterfaceStyle == .dark ? dark : light)
        })
    }
}

private extension UIColor {
    convenience init(hex: UInt) {
        self.init(
            red: CGFloat((hex >> 16) & 0xFF) / 255,
            green: CGFloat((hex >> 8) & 0xFF) / 255,
            blue: CGFloat(hex & 0xFF) / 255,
            alpha: 1
        )
    }
}
