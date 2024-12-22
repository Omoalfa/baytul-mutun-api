import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'is_public'

const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export default Public;
