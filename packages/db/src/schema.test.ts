import { describe, expect, it } from "vitest";

import { EventStatus, Role } from "../prisma/generated/enums";
import { EventScalarFieldEnum } from "../prisma/generated/internal/prismaNamespace";

describe("schema matches contrat/openapi.yaml", () => {
  it("exposes every Event property of the contract", () => {
    const contractFields = [
      "id",
      "name",
      "description",
      "categoryId",
      "organizerId",
      "startDate",
      "endDate",
      "location",
      "latitude",
      "longitude",
      "capacity",
      "status",
      "createdAt",
      "updatedAt",
    ];
    expect(Object.values(EventScalarFieldEnum)).toEqual(expect.arrayContaining(contractFields));
  });

  it("uses the contract enum values for event status and admin role", () => {
    expect(Object.values(EventStatus)).toEqual(["published", "cancelled"]);
    expect(Object.values(Role)).toContain("admin");
  });
});
