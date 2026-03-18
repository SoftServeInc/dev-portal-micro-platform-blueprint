import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const LoggerPlugin = createPlugin({
  id: 'logger',
  routes: {
    root: rootRouteRef,
  },
});

export const LoggerPage = LoggerPlugin.provide(
  createRoutableExtension({
    name: 'loggerPage',
    component: () =>
      import('./components/LoggerComponent').then(m => m.LoggerComponent),
    mountPoint: rootRouteRef,
  }),
);
