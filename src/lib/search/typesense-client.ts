import Typesense from 'typesense';

let client: any | null = null;

export function getTypesenseClient() {
  if (
    !process.env.TYPESENSE_HOST ||
    !process.env.TYPESENSE_API_KEY ||
    !process.env.TYPESENSE_PROTOCOL
  ) {
    return null; // fallback mode
  }
  if (!client) {
    client = new Typesense.Client({
      nodes: [
        {
          host: process.env.TYPESENSE_HOST!,
          port: Number(process.env.TYPESENSE_PORT || 443),
          protocol: process.env.TYPESENSE_PROTOCOL!,
        },
      ],
      apiKey: process.env.TYPESENSE_API_KEY!,
      connectionTimeoutSeconds: 8,
    });
  }
  return client;
}