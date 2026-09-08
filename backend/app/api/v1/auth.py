print("=" * 50)
print("USERNAME DITERIMA :", repr(data.username))

user = user_repository.get_by_username(
    db,
    data.username
)

print("HASIL QUERY USER :", user)