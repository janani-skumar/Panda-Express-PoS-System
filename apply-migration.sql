-- Apply migration to add sequence for cooked.id
CREATE SEQUENCE IF NOT EXISTS "cooked_id_seq";
ALTER TABLE "cooked" ALTER COLUMN "id" SET DEFAULT nextval('cooked_id_seq');
SELECT setval('cooked_id_seq', COALESCE((SELECT MAX(id) FROM "cooked"), 0) + 1, false);
ALTER SEQUENCE "cooked_id_seq" OWNED BY "cooked"."id";

-- Apply migration to fix sequence for inventory.id
CREATE SEQUENCE IF NOT EXISTS "inventory_id_seq";
ALTER TABLE "inventory" ALTER COLUMN "id" SET DEFAULT nextval('inventory_id_seq');
SELECT setval('inventory_id_seq', COALESCE((SELECT MAX(id) FROM "inventory"), 0) + 1, false);
ALTER SEQUENCE "inventory_id_seq" OWNED BY "inventory"."id";

-- Apply migration to fix sequence for recipes.id
CREATE SEQUENCE IF NOT EXISTS "recipes_id_seq";
ALTER TABLE "recipes" ALTER COLUMN "id" SET DEFAULT nextval('recipes_id_seq');
SELECT setval('recipes_id_seq', COALESCE((SELECT MAX(id) FROM "recipes"), 0) + 1, false);
ALTER SEQUENCE "recipes_id_seq" OWNED BY "recipes"."id";

-- Apply migration to fix sequence for roles.id
CREATE SEQUENCE IF NOT EXISTS "roles_id_seq";
ALTER TABLE "roles" ALTER COLUMN "id" SET DEFAULT nextval('roles_id_seq');
SELECT setval('roles_id_seq', COALESCE((SELECT MAX(id) FROM "roles"), 0) + 1, false);
ALTER SEQUENCE "roles_id_seq" OWNED BY "roles"."id";