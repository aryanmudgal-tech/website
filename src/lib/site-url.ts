const configuredBase = import.meta.env.BASE_URL;

export const siteBaseUrl = configuredBase.endsWith("/") ? configuredBase : `${configuredBase}/`;

export const publicAssetUrl = (path: string) => `${siteBaseUrl}${path.replace(/^\/+/, "")}`;
