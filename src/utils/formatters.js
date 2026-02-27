// Format date as DD-MMM-YYYY (Indian format)
export function formatDate(dateStr) {
  const date = dateStr ? new Date(dateStr) : new Date();
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const dd = String(date.getDate()).padStart(2, "0");
  const mmm = months[date.getMonth()];
  const yyyy = date.getFullYear();
  return `${dd}-${mmm}-${yyyy}`;
}

// Format date and time
export function formatDateTime(dateStr) {
  const date = dateStr ? new Date(dateStr) : new Date();
  return `${formatDate(dateStr)} ${date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
}

// Get date in YYMMDD format for slip number
export function getDateCode(date = new Date()) {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}
