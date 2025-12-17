type ParsedError = {
    message: string;
};

/**
 * Convert an API response into a concise, user-facing error message.
 * - Surfaces duplicate-name violations.
 * - Surfaces delete-in-use conflicts.
 * - Falls back to status text when the body is empty.
 */
export async function parseApiError(res: Response): Promise<ParsedError> {
    let bodyText = "";
    let data: any = null;

    const contentType = res.headers.get("content-type") ?? "";

    try {
        if (contentType.includes("application/json")) {
            data = await res.json();
        } else {
            bodyText = await res.text();
        }
    } catch {
        try {
            bodyText = bodyText || (await res.text());
        } catch {
            // ignore
        }
    }

    const details = typeof data?.details === "string" ? data.details : "";
    const error = typeof data?.error === "string" ? data.error : "";
    const message = typeof data?.message === "string" ? data.message : "";
    const merged =
        [error, message, details, bodyText].find(
            (val) => typeof val === "string" && val.trim().length > 0
        ) || res.statusText;

    const lowerMerged = merged.toLowerCase();

    // Duplicate name detection (Postgres unique constraint style)
    if (
        lowerMerged.includes("duplicate key") ||
        lowerMerged.includes("unique constraint") ||
        lowerMerged.includes("already exists")
    ) {
        const nameMatch = merged.match(/Key \\(name\\)=\\(([^)]+)\\)/i);
        if (nameMatch?.[1]) {
            return { message: `Name "${nameMatch[1]}" already exists.` };
        }
        return { message: "Name already exists." };
    }

    // Foreign key delete conflict
    if (
        res.status === 409 ||
        lowerMerged.includes("referenced by other") ||
        lowerMerged.includes("cannot delete")
    ) {
        return { message: "Cannot delete: item is used by other records." };
    }

    return { message: merged || "Request failed." };
}


