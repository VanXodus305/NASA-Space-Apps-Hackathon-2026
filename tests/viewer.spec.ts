import { test, expect } from "@playwright/test";
const payload = {
  query: {
    ra: 133.795129,
    dec: -7.245147,
    size_deg: 0.1,
    band: "D2",
    release: "qr2",
  },
  dropped: 1,
  frames: [2, 0, 1].map((i) => ({
    id: `000000000000000${i}`,
    obs_mjd: 60820 + i,
    obs_iso: `2025-06-0${i + 1}T02:52:00Z`,
    detector: "D2",
    wavelength_um: [1.1, 1.62],
    image_url: `/api/frames/000000000000000${i}.png`,
  })),
};
async function mock(
  page: import("@playwright/test").Page,
  body: unknown = payload,
  status = 200,
) {
  await page.route("**/viewer/jpeg-cutout?*", (route) =>
    route.fulfill({
      contentType: "image/png",
      body: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
        "base64",
      ),
    }),
  );
  await page.route("**/api/frames?*", (route) =>
    route.fulfill({ json: body, status }),
  );
  await page.route("**/api/frames/*.png", (route) =>
    route.fulfill({
      contentType: "image/png",
      body: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
        "base64",
      ),
    }),
  );
}
test("all pages render on desktop and mobile without overflow or runtime errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/targets", "/about"]) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      if (path === "/") {
        const empty = page.getByRole("status");
        await expect(empty).toHaveCSS("opacity", "1");
        const bounds = await empty.boundingBox();
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `test-results/${path === "/" ? "home" : path.slice(1)}-${width}.png`,
        fullPage: true,
      });
    }
  }
  expect(errors).toEqual([]);
});
test("shared WISE search omits release, sorts epochs, plays, pauses, scrubs, and shares", async ({
  page,
  context,
}) => {
  await mock(page);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const request = page.waitForRequest((r) => r.url().includes("/api/frames?"));
  await page.goto(
    "/?ra=08h55m10.831s&dec=-7d14m42.53s&band=D2&release=auto#observatory",
  );
  const url = new URL((await request).url());
  expect(url.searchParams.has("release")).toBe(false);
  await expect(
    page.getByText("Auto fallback:", { exact: false }),
  ).toBeVisible();
  await expect(page.getByText("2025-06-01 · 02:52:00 UTC")).toBeVisible();
  await expect(
    page.getByText("1 cutout(s) failed", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next frame" }).click();
  await expect(page.getByText("2025-06-02 · 02:52:00 UTC")).toBeVisible();
  await page.getByRole("button", { name: "Play playback" }).click();
  await expect(
    page.getByRole("button", { name: "Pause playback" }),
  ).toBeVisible();
  await expect(
    page.getByRole("slider", { name: "Observation timeline" }),
  ).not.toHaveValue("1");
  await page.getByRole("button", { name: "Pause playback" }).click();
  await page.getByRole("slider", { name: "Observation timeline" }).focus();
  await page.keyboard.press("Home");
  await expect(page.getByText("2025-06-01 · 02:52:00 UTC")).toBeVisible();
  await page.getByRole("button", { name: "Share search" }).click();
  await expect(page.getByText("Link copied", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "release=auto",
  );
  await expect(page.getByTestId("sky-context-map")).toBeVisible();
});
test("coordinate precedence and colon normalization", async ({ page }) => {
  await mock(page);
  await page.goto("/");
  await page.getByLabel("OBJECT NAME", { exact: true }).fill("ignored");
  await page
    .getByLabel("RIGHT ASCENSION", { exact: true })
    .fill("08:55:10.831");
  await page.getByLabel("DECLINATION", { exact: true }).fill("-7:14:42.53");
  await page.getByRole("button", { name: /DATA RELEASE/ }).click();
  await page.getByRole("option", { name: "QR3", exact: true }).click();
  const pending = page.waitForRequest((r) => r.url().includes("/api/frames?"));
  await page.getByRole("button", { name: "Search the sky" }).click();
  const url = new URL((await pending).url());
  expect(url.searchParams.get("ra")).toBe("08h55m10.831s");
  expect(url.searchParams.has("name")).toBe(false);
  expect(url.searchParams.get("release")).toBe("qr3");
});
test("empty, 400, 502 and image failures have actionable states", async ({
  page,
}) => {
  await mock(page, { ...payload, frames: [], dropped: 0 });
  await page.goto("/?name=empty");
  await expect(page.getByText("NO COVERAGE FOUND")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Play playback" }),
  ).toBeDisabled();
  for (const [status, detail] of [
    [400, "could not parse ra/dec"],
    [502, "IRSA search failed"],
  ] as const) {
    await page.route("**/api/frames?*", (route) =>
      route.fulfill({ status, json: { detail } }),
    );
    await page.getByRole("button", { name: "Search the sky" }).click();
    await expect(page.locator("#observatory").getByRole("alert")).toContainText(
      detail,
    );
  }
  await page.route("**/api/frames?*", (route) =>
    route.fulfill({ json: payload }),
  );
  await page.route("**/api/frames/*.png", (route) =>
    route.fulfill({ status: 404 }),
  );
  await page.getByRole("button", { name: "Search the sky" }).click();
  await expect(page.getByText("This frame couldn’t load.")).toBeVisible();
});
test("all five presets auto-run and filters work", async ({ page }) => {
  await mock(page);
  for (const name of [
    "Barnard’s Star",
    "WISE 0855",
    "Epsilon Indi B",
    "RW Aurigae",
    "R Draconis",
  ]) {
    await page.goto("/targets");
    const pending = page.waitForRequest((r) =>
      r.url().includes("/api/frames?"),
    );
    await page
      .locator(".card")
      .filter({ has: page.getByRole("heading", { name, exact: true }) })
      .getByRole("link", { name: "Open in viewer" })
      .click();
    await pending;
    await expect(page.getByText("ACTUAL SEARCH POSITION")).toBeVisible();
  }
  await page.goto("/targets");
  await page.getByRole("button", { name: "Brightness", exact: true }).click();
  await expect(page.getByRole("heading", { name: "RW Aurigae" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Barnard’s Star" }),
  ).toHaveCount(0);
});

test("HeroUI dropdowns, number controls and timeline support keyboard input", async ({
  page,
}) => {
  await mock(page);
  await page.goto("/?name=RW+Aur");
  await expect(page.getByText("ACTUAL SEARCH POSITION")).toBeVisible();
  await page.getByRole("button", { name: /DETECTOR \/ WAVELENGTH/ }).click();
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.getByRole("option", { name: /D6 ·/ }).click();
  await expect(
    page.getByRole("button", { name: /DETECTOR \/ WAVELENGTH/ }),
  ).toContainText("D6");
  await page.getByRole("button", { name: "Increase field of view" }).click();
  const size = page.getByRole("textbox", { name: /FIELD OF VIEW/ });
  await expect(size).toHaveValue("0.11");
  const increment = await page
    .getByRole("button", { name: /Increase field of view/ })
    .boundingBox();
  const decrement = await page
    .getByRole("button", { name: /Decrease field of view/ })
    .boundingBox();
  expect(Math.abs(increment!.y - decrement!.y)).toBeLessThan(1);
  expect(increment!.x).toBeGreaterThan(decrement!.x);
  await size.fill("0.123456");
  await size.press("Tab");
  await expect(size).toHaveValue("0.123456");
  const preciseRequest = page.waitForRequest((r) =>
    r.url().includes("/api/frames?"),
  );
  await page.getByRole("button", { name: "Search the sky" }).click();
  expect(new URL((await preciseRequest).url()).searchParams.get("size")).toBe(
    "0.123456",
  );
  await expect(page.getByText("ACTUAL SEARCH POSITION")).toBeVisible();
  await page.getByRole("button", { name: /Playback speed/ }).click();
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: /Playback speed/ }),
  ).toContainText("4×");
  const timeline = page.getByRole("slider", { name: "Observation timeline" });
  await timeline.focus();
  await timeline.press("End");
  await expect(page.getByText("2025-06-03 · 02:52:00 UTC")).toBeVisible();
  await timeline.press("Home");
  await expect(page.getByText("2025-06-01 · 02:52:00 UTC")).toBeVisible();
});

test("motion-enabled navigation and magnetic links remain interactive", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const cta = page.getByRole("link", { name: "Explore the sky", exact: true });
  await cta.hover();
  await cta.click();
  await expect(
    page.getByRole("button", { name: "Search the sky" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /DETECTOR \/ WAVELENGTH/ }).click();
  await expect(page.getByRole("listbox")).toBeVisible();
  await expect(page.locator("[data-slot=select-popover]")).toHaveCSS(
    "opacity",
    "1",
  );
  await page.screenshot({ path: "test-results/heroui-dropdown.png" });
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "Targets", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /Small lights/ }),
  ).toBeVisible();
  await page.locator(".card").first().hover();
  await page.getByRole("button", { name: "Brightness", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "RW Aurigae", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("dropdown values are centered and the hero animates only when motion is enabled", async ({
  page,
}) => {
  await page.goto("/");
  for (const name of [
    /DETECTOR \/ WAVELENGTH/,
    /DATA RELEASE/,
    /Playback speed/,
  ]) {
    const trigger = page.getByRole("button", { name });
    const offset = await trigger.evaluate((element) => {
      const value = element.querySelector('[data-slot="select-value"]')!;
      const range = document.createRange();
      range.selectNodeContents(value);
      const text = range.getBoundingClientRect();
      const box = element.getBoundingClientRect();
      return {
        x: Math.abs(text.x + text.width / 2 - box.x - box.width / 2),
        y: Math.abs(text.y + text.height / 2 - box.y - box.height / 2),
      };
    });
    expect(offset.x).toBeLessThan(3);
    expect(offset.y).toBeLessThan(3);
  }
  const orbit = page.getByTestId("orbital-motion");
  const still = await orbit.getAttribute("style");
  await page.waitForTimeout(350);
  expect(await orbit.getAttribute("style")).toBe(still);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.reload();
  await expect(page.locator("h1")).toBeVisible();
  const moving = await orbit.getAttribute("style");
  await expect.poll(() => orbit.getAttribute("style")).not.toBe(moving);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "test-results/animated-hero.png" });
});
