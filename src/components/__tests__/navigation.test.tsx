// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { NAV_ITEMS } from "../layout/Sidebar";

describe("UI Primitives & Navigation Structure", () => {
  it("Button renders text correctly and reflects loading state", () => {
    const { rerender } = render(<Button>Click Me</Button>);
    expect(screen.getByRole("button").textContent).toBe("Click Me");

    rerender(<Button isLoading>Click Me</Button>);
    const button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("Badge renders with correct variant content", () => {
    render(<Badge variant="teal">Cardiology</Badge>);
    expect(screen.getByText("Cardiology")).toBeDefined();
  });

  it("NAV_ITEMS contains mandatory navigation routes for Dashboard, Doctors, and Patients", () => {
    const routes = NAV_ITEMS.map((item) => item.href);
    expect(routes).toContain("/dashboard");
    expect(routes).toContain("/doctors");
    expect(routes).toContain("/patients");

    const names = NAV_ITEMS.map((item) => item.name);
    expect(names).toContain("Dashboard");
    expect(names).toContain("Doctors");
    expect(names).toContain("Patients");
  });
});
