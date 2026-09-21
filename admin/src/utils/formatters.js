export function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function truncate(value, length = 60) {
  const text = String(value || "");

  return text.length > length
    ? `${text.slice(0, length - 1)}…`
    : text;
}

export function getId(item) {
  return item?._id || item?.id;
}

export function getApiData(response) {
  return response?.data?.data || response?.data || {};
}
