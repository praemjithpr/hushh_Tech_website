const HUSHH_WALLET_ENDPOINT = "/api/wallet-pass";
const HUSHH_GOOGLE_WALLET_ENDPOINT = "/api/google-wallet-pass";

export const APPLE_WALLET_SUPPORT_MESSAGE =
  "Available on iPhone in Wallet-supported browsers.";
export const GOOGLE_WALLET_SUPPORT_MESSAGE =
  "Google Wallet is temporarily unavailable while we finish the wallet issuer setup.";

export interface WalletPassInput {
  name: string;
  email?: string | null;
  organisation?: string | null;
  slug?: string | null;
  userId?: string | null;
  investmentAmount?: number | null;
}

export interface WalletPreviewModel {
  badgeText: string;
  title: string;
  holderName: string;
  organizationName: string;
  membershipId: string;
  investmentClass: string;
  email: string;
  qrValue: string;
  profileUrl: string | null;
}

export interface GoogleWalletAvailability {
  available: boolean;
  message: string;
  provider: "local" | "upstream" | "none";
}

interface WalletPassResult {
  blob: Blob;
  filename: string;
}

interface GoogleWalletResult {
  saveUrl?: string;
  blob?: Blob;
  filename?: string;
}

interface AppleWalletSupportInput {
  userAgent?: string;
  platform?: string;
  maxTouchPoints?: number;
}

interface GoldPassDescriptor {
  investorName: string;
  organizationName: string;
  investmentClass: string;
  membershipId: string;
  email: string;
  passUrl: string;
  publicProfileUrl: string | null;
}

const DEFAULT_GOOGLE_WALLET_AVAILABILITY: GoogleWalletAvailability = {
  available: false,
  message: GOOGLE_WALLET_SUPPORT_MESSAGE,
  provider: "none",
};

let googleWalletAvailabilityCache: GoogleWalletAvailability | null = null;
let googleWalletAvailabilityRequest: Promise<GoogleWalletAvailability> | null =
  null;

const sanitizeForFilename = (value: string) => {
  const safe = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return safe || "hushh-gold-card";
};

const getDisplayValue = (value?: string | null, fallback = "Not provided") =>
  value && value.trim().length > 0 ? value : fallback;

const getInvestmentClass = (amount?: number | null) => {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "Class C";
  if (amount >= 5_000_000) return "Class A";
  if (amount >= 2_000_000) return "Class B";
  return "Class C";
};

const buildPublicProfileUrl = (input: WalletPassInput) =>
  input.slug ? `https://hushhtech.com/investor/${input.slug}` : null;

const buildMembershipId = (input: WalletPassInput) =>
  input.slug ||
  input.userId ||
  (input.email ? input.email.split("@")[0] : "hushh-investor");

const buildGoldPassDescriptor = (input: WalletPassInput): GoldPassDescriptor => {
  const publicProfileUrl = buildPublicProfileUrl(input);

  return {
    investorName: getDisplayValue(input.name, "Hushh Investor"),
    organizationName: getDisplayValue(input.organisation, "Hushh"),
    investmentClass: getInvestmentClass(input.investmentAmount),
    membershipId: buildMembershipId(input),
    email: getDisplayValue(input.email, "—"),
    passUrl: publicProfileUrl || "https://hushhtech.com",
    publicProfileUrl,
  };
};

async function readWalletError(response: Response, fallback: string) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      const payload = await response.json();
      if (typeof payload?.detail === "string" && payload.detail.trim()) {
        return payload.detail;
      }
      if (typeof payload?.error === "string" && payload.error.trim()) {
        return payload.error;
      }
    } catch {
      return fallback;
    }
  }

  const errorText = await response.text().catch(() => "");
  return errorText || fallback;
}

const submitWalletPassForm = (
  endpoint: string,
  payload: ReturnType<typeof buildGoldPassPayload>
) => {
  if (typeof document === "undefined") {
    throw new Error("Wallet pass downloads require a browser environment");
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = endpoint;
  form.style.display = "none";

  const payloadInput = document.createElement("input");
  payloadInput.type = "hidden";
  payloadInput.name = "payload";
  payloadInput.value = JSON.stringify(payload);
  form.appendChild(payloadInput);

  (document.body || document.documentElement).appendChild(form);
  form.submit();
  window.setTimeout(() => form.remove(), 1000);
};

export const buildGoldPassPayload = (input: WalletPassInput) => {
  const descriptor = buildGoldPassDescriptor(input);

  return {
    passType: "storeCard",
    description: "Hushh Gold Investor Pass",
    organizationName: "Hushh Technologies",
    logoText: "hushh Gold Pass",
    backgroundColor: "rgb(212, 175, 55)",
    foregroundColor: "rgb(12, 12, 12)",
    labelColor: "rgb(32, 32, 32)",
    headerFields: [
      {
        key: "status",
        label: "Status",
        value: "Gold Member",
        textAlignment: "PKTextAlignmentLeft",
      },
      {
        key: "org",
        label: "Organization",
        value: descriptor.organizationName,
        textAlignment: "PKTextAlignmentLeft",
      },
    ],
    primaryFields: [
      {
        key: "investor",
        label: "Holder",
        value: descriptor.investorName,
        textAlignment: "PKTextAlignmentLeft",
      },
    ],
    secondaryFields: [
      {
        key: "class",
        label: "Investor",
        value: `Investor - ${descriptor.investmentClass}`,
        textAlignment: "PKTextAlignmentLeft",
      },
    ],
    auxiliaryFields: [
      {
        key: "email",
        label: "Email",
        value: descriptor.email,
        textAlignment: "PKTextAlignmentLeft",
      },
      {
        key: "memberId",
        label: "Membership ID",
        value: descriptor.membershipId,
        textAlignment: "PKTextAlignmentLeft",
      },
    ],
    barcode: {
      message: descriptor.passUrl,
      format: "PKBarcodeFormatQR",
      altText: "Hushh Gold Pass QR",
    },
    webServiceURL: descriptor.passUrl,
  };
};

export const buildGoldPassPreviewModel = (
  input: WalletPassInput
): WalletPreviewModel => {
  const descriptor = buildGoldPassDescriptor(input);

  return {
    badgeText: "HUSHH GOLD",
    title: "Hushh Gold Investor Pass",
    holderName: descriptor.investorName,
    organizationName: descriptor.organizationName,
    membershipId: descriptor.membershipId,
    investmentClass: descriptor.investmentClass,
    email: descriptor.email,
    qrValue: descriptor.passUrl,
    profileUrl: descriptor.publicProfileUrl,
  };
};

export const isAppleWalletSupported = (
  input: AppleWalletSupportInput = {}
) => {
  const nav = typeof navigator !== "undefined" ? navigator : undefined;
  const userAgent = input.userAgent ?? nav?.userAgent ?? "";
  const platform = input.platform ?? nav?.platform ?? "";
  const maxTouchPoints = input.maxTouchPoints ?? nav?.maxTouchPoints ?? 0;

  const isAppleMobilePlatform = /(iPhone|iPad|iPod)/i.test(platform);
  const isIpadOs = platform === "MacIntel" && maxTouchPoints > 1;
  const isMobileAppleUserAgent = /(iPhone|iPad|iPod)/i.test(userAgent);

  return (
    isAppleMobilePlatform ||
    isIpadOs ||
    (isMobileAppleUserAgent && maxTouchPoints > 1)
  );
};

export async function fetchGoogleWalletAvailability(
  options: { force?: boolean } = {}
): Promise<GoogleWalletAvailability> {
  const { force = false } = options;

  if (!force && googleWalletAvailabilityCache) {
    return googleWalletAvailabilityCache;
  }

  if (!force && googleWalletAvailabilityRequest) {
    return googleWalletAvailabilityRequest;
  }

  googleWalletAvailabilityRequest = fetch(HUSHH_GOOGLE_WALLET_ENDPOINT, {
    method: "GET",
  })
    .then(async (response) => {
      if (!response.ok) {
        return DEFAULT_GOOGLE_WALLET_AVAILABILITY;
      }

      const payload = await response.json().catch(() => null);
      const availability: GoogleWalletAvailability = {
        available: Boolean(payload?.available),
        message:
          typeof payload?.message === "string" && payload.message.trim().length > 0
            ? payload.message
            : GOOGLE_WALLET_SUPPORT_MESSAGE,
        provider:
          payload?.provider === "local" || payload?.provider === "upstream"
            ? payload.provider
            : "none",
      };

      googleWalletAvailabilityCache = availability;
      return availability;
    })
    .catch(() => DEFAULT_GOOGLE_WALLET_AVAILABILITY)
    .finally(() => {
      googleWalletAvailabilityRequest = null;
    });

  return googleWalletAvailabilityRequest;
}

export async function requestHushhGoldPass(
  input: WalletPassInput
): Promise<WalletPassResult> {
  const response = await fetch(HUSHH_WALLET_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildGoldPassPayload(input)),
  });

  if (!response.ok) {
    throw new Error(
      await readWalletError(response, "Wallet pass generation failed")
    );
  }

  const blob = await response.blob();
  const filename = `${sanitizeForFilename(input.name)}-hushh-gold.pkpass`;

  return { blob, filename };
}

export async function downloadHushhGoldPass(
  input: WalletPassInput
): Promise<void> {
  submitWalletPassForm(HUSHH_WALLET_ENDPOINT, buildGoldPassPayload(input));
}

export async function requestGoogleWalletPass(
  input: WalletPassInput
): Promise<GoogleWalletResult> {
  const response = await fetch(HUSHH_GOOGLE_WALLET_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildGoldPassPayload(input)),
  });

  if (!response.ok) {
    throw new Error(
      await readWalletError(response, "Google Wallet pass generation failed")
    );
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = await response.json();
    if (data.saveUrl) {
      return { saveUrl: data.saveUrl as string };
    }
  }

  const blob = await response.blob();
  const filename = `${sanitizeForFilename(input.name)}-hushh-gold-google.pkpass`;
  return { blob, filename };
}

export async function launchGoogleWalletPass(
  input: WalletPassInput
): Promise<void> {
  const result = await requestGoogleWalletPass(input);

  if (result.saveUrl) {
    window.location.href = result.saveUrl;
    return;
  }

  if (result.blob && result.filename) {
    const url = window.URL.createObjectURL(result.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 4000);
  }
}
