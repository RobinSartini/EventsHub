import { describe, expect, it } from "vitest";

import { capacityStatus } from "./capacity";

describe("capacityStatus", () => {
  it("affiche 26 places disponibles pour 34 sur 60", () => {
    expect(capacityStatus(34, 60)).toEqual({ level: "calm", hint: "26 places disponibles" });
  });

  it("affiche Plus que 18 places pour 62 sur 80", () => {
    expect(capacityStatus(62, 80)).toEqual({ level: "hot", hint: "Plus que 18 places" });
  });

  it("passe en alerte à partir de 75 %", () => {
    expect(capacityStatus(59, 80).level).toBe("calm");
    expect(capacityStatus(60, 80).level).toBe("hot");
  });

  it("accorde au singulier", () => {
    expect(capacityStatus(59, 60).hint).toBe("Plus que 1 place");
    expect(capacityStatus(0, 1).hint).toBe("1 place disponible");
  });

  it("affiche Complet pour 80 sur 80, et aussi en cas de surréservation", () => {
    expect(capacityStatus(80, 80)).toEqual({ level: "full", hint: "Complet" });
    expect(capacityStatus(85, 80)).toEqual({ level: "full", hint: "Complet" });
  });
});
