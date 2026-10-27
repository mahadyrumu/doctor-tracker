// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { NAV_ITEMS } from "../layout/Sidebar";
import { Header } from "../layout/Header";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

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

  it("Header renders profile trigger and toggles profile & sign out dropdown", () => {
    render(<Header onMenuToggle={() => {}} />);
    
    // Profile button exists
    const trigger = screen.getByText("Admin Portal");
    expect(trigger).toBeDefined();

    // Click trigger to open dropdown
    fireEvent.click(trigger);

    // Profile and Sign Out options should now be visible
    expect(screen.getByText("Profile")).toBeDefined();
    expect(screen.getByText("Sign Out")).toBeDefined();
  });
});
