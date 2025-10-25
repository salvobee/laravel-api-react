# Laravel API React

A tiny React hook that wraps `@salvobee/laravel-api-react` and provides a ready-to-use CRUD client for resource-based APIs.  
If no `routeFn` is passed, it uses a Laravel-style resolver by default (via the core).

## Install

```bash
npm i @salvobee/laravel-api-react
```

## Usage (TypeScript / React)
```typescript jsx
import axios from "axios";
import { useApiResource } from "@salvobee/laravel-api-react";

type Post = { id: number; title: string };
type PostList = { data: Post[]; meta: any };

export function Posts() {
  const api = useApiResource<Post, PostList>({
    resourceKey: "posts",
    resourceRouteParam: "post",
    client: axios.create({ baseURL: "https://laravelapp.com/api" }),
    // routeFn: route, // pass Ziggy or any resolver if you want
  });

  // Example
  async function load() {
    const list = await api.list({ page: 1 });
    console.log(list);
  }

  return <button onClick={load}>Load Posts</button>;
}
```

## With Ziggy
```tsx
import route from "ziggy-js";

const api = useApiResource({
  resourceKey: "photos",
  resourceRouteParam: "photo",
  client: axiosInstance,
  routeFn: (name, params) => route(name, params),
});
```

### Validation errors

The hook exposes `errors` (or `null`) and `resetErrors()`.

```tsx
const { store, errors, resetErrors } = useApiResource<Post, PostList>({
  resourceKey: "posts",
  resourceRouteParam: "post",
  client: axios.create({ baseURL: "/api" }),
});

async function onSubmit(values: any) {
  resetErrors();
  try {
    await store(values);
    // success path
  } catch (e) {
    // if it's a Laravel 422, `errors` is now populated:
    // { title: ["The title field is required."], ... }
  }
}
```

Pass `clearErrorsOnCall: false` if you want to preserve previous errors between calls.

## Notes
* list() returns the full response.data; get/update/store() return response.data.data when present.

## License

MIT © Salvo Bee