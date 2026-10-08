import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { messages } from "../lib/translations";
import { renderWithLang } from "../test/render";
import { DownloadSection } from "./DownloadSection";

const insert = vi.fn();
vi.mock("../lib/supabase", () => ({
  getSupabase: () => ({ from: () => ({ insert }) }),
}));

const s = messages.en.download.status;

async function submit(email: string) {
  const user = userEvent.setup();
  renderWithLang(<DownloadSection />);
  const input = screen.getByLabelText(messages.en.download.emailAria);
  if (email) await user.type(input, email);
  await user.click(screen.getByRole("button", { name: new RegExp(messages.en.download.submitIdle) }));
  return input as HTMLInputElement;
}

beforeEach(() => {
  insert.mockReset();
});

describe("DownloadSection waitlist", () => {
  it("shows the default status initially", () => {
    renderWithLang(<DownloadSection />);
    expect(screen.getByRole("status")).toHaveTextContent(s.default);
  });

  it("subscribes a new email and clears the field", async () => {
    insert.mockResolvedValue({ error: null });
    const input = await submit("me@example.com");
    expect(insert).toHaveBeenCalledWith({ email: "me@example.com" });
    expect(await screen.findByText(s.success)).toBeInTheDocument();
    expect(input.value).toBe("");
  });

  it("treats a duplicate email as already subscribed", async () => {
    insert.mockResolvedValue({ error: { code: "23505", message: "duplicate" } });
    await submit("me@example.com");
    expect(await screen.findByText(s.already)).toBeInTheDocument();
  });

  it("shows an error when the insert fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    insert.mockResolvedValue({ error: { code: "42501", message: "denied" } });
    await submit("me@example.com");
    expect(await screen.findByText(s.error)).toBeInTheDocument();
  });

  it("shows an error when the network throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    insert.mockImplementation(async () => {
      throw new TypeError("Failed to fetch");
    });
    await submit("me@example.com");
    expect(await screen.findByText(s.error)).toBeInTheDocument();
  });

  it("disables the button while submitting", async () => {
    let resolve!: (v: { error: null }) => void;
    insert.mockReturnValue(new Promise((r) => (resolve = r)));
    await submit("me@example.com");
    const button = screen.getByRole("button", { name: new RegExp(messages.en.download.submitting) });
    expect(button).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent(s.adding);
    resolve({ error: null });
    expect(await screen.findByText(s.success)).toBeInTheDocument();
  });
});
