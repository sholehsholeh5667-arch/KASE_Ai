from app.main import app


print("=" * 110)
print("AUDIT SEMUA ENDPOINT FASTAPI")
print("=" * 110)


def get_route_dependency_names(route):
    """
    Mengambil nama dependency yang terpasang pada route.
    """
    names = []

    for dependency in getattr(route, "dependant", None).dependencies:
        call = dependency.call

        name = getattr(
            call,
            "__name__",
            str(call),
        )

        names.append(name)

    return names


# ==========================================================
# ROOT ROUTES
# ==========================================================

for route in app.routes:

    # FastAPI APIRoute
    if not hasattr(route, "path"):
        continue

    path = route.path

    methods = getattr(
        route,
        "methods",
        set(),
    )

    # Hanya endpoint HTTP
    if not methods:
        continue

    dependency_names = get_route_dependency_names(route)

    print()
    print("-" * 110)
    print(
        f"{','.join(sorted(methods)):10} "
        f"{path}"
    )

    if dependency_names:
        print(
            "DEPENDENCY : "
            + ", ".join(dependency_names)
        )
    else:
        print(
            "DEPENDENCY : -"
        )


print()
print("=" * 110)
print("AUDIT SELESAI")
print("=" * 110)