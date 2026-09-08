from fastapi.routing import APIRoute

from app.main import app
from app.database.rbac_final_map import ENDPOINT_RBAC


def collect_routes(container, result=None, visited=None):
    if result is None:
        result = []

    if visited is None:
        visited = set()

    object_id = id(container)

    if object_id in visited:
        return result

    visited.add(object_id)

    routes = getattr(container, "routes", None)

    if routes:
        for route in routes:

            if isinstance(route, APIRoute):
                result.append(route)
                continue

            original_router = getattr(
                route,
                "original_router",
                None,
            )

            if original_router is not None:
                collect_routes(
                    original_router,
                    result,
                    visited,
                )

    original_router = getattr(
        container,
        "original_router",
        None,
    )

    if original_router is not None:
        collect_routes(
            original_router,
            result,
            visited,
        )

    return result


routes = collect_routes(app)

unique = {}

for route in routes:
    key = (
        route.path,
        tuple(sorted(route.methods)),
    )

    unique[key] = route

routes = list(unique.values())

routes.sort(
    key=lambda r: (
        r.path,
        ",".join(sorted(r.methods)),
    )
)


print("=" * 120)
print("ENDPOINT BELUM TERPETAKAN")
print("=" * 120)

count = 0

for route in routes:

    methods = sorted(route.methods)

    for method in methods:

        key = (
            method,
            route.path,
        )

        if key not in ENDPOINT_RBAC:

            count += 1

            print(
                f"{count:>3}. "
                f"{method:<8} "
                f"{route.path}"
            )


print("-" * 120)

print(
    f"TOTAL BELUM TERPETAKAN : {count}"
)

print("=" * 120)