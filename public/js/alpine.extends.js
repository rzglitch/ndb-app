document.addEventListener("alpine:init", () => {
  Alpine.directive("component", (el, { expression }) => {
    const template = document.getElementById(`template-${expression}`);
    if (template) {
      el.innerHTML = template.innerHTML;
      Alpine.initTree(el);
    }
  });
  Alpine.directive("formatted-date", el => {
    el.textContent = dayjs(el.textContent).format('MMM D, YYYY');
  });
});
