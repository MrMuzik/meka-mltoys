if (!customElements.get("featured-highlight-bubbles")) {
  class FeaturedHighlightBubbles extends HTMLElement {
    constructor() {
      super();
      this.bubbles = Array.from(
        this.querySelectorAll(".mfh-bubble[data-target]"),
      );
      this.listItems =
        this.closest(".mfh-wrap")?.querySelectorAll(".mfh-list__item") || [];

      this.bubbles.forEach((bubble) => {
        bubble.addEventListener(
          "mouseenter",
          this.onBubbleEnter.bind(this, bubble),
        );
        bubble.addEventListener(
          "mouseleave",
          this.onBubbleLeave.bind(this, bubble),
        );
      });
    }

    onBubbleEnter(bubble) {
      const listItem = this.getLinkedListItem(bubble);
      if (listItem) listItem.classList.add("is-active");
    }

    onBubbleLeave(bubble) {
      const listItem = this.getLinkedListItem(bubble);
      if (listItem) listItem.classList.remove("is-active");
    }

    getLinkedListItem(bubble) {
      const target = bubble.dataset.target;
      if (!target) return null;
      return (
        this.closest(".mfh-wrap")?.querySelector(
          `.mfh-list__item[data-list-index="${target}"]`,
        ) || null
      );
    }
  }

  customElements.define("featured-highlight-bubbles", FeaturedHighlightBubbles);
}
