import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Bu dekoratörle işaretlenen endpoint'ler JWT doğrulamasından muaftır. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
