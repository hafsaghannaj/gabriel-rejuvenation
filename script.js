const tabs = Array.from(document.querySelectorAll(".tab"));
const panels = Array.from(document.querySelectorAll(".panel"));
const tabsNav = document.querySelector(".tabs__nav");
const tabsContent = document.querySelector(".tabs__content");
const tabIndicator = document.querySelector(".tab-indicator");

let activeTab = document.querySelector(".tab.active");
let activePanel = document.querySelector(".panel.active");

const getTransitionDuration = (element) => {
  if (!element) return 0;
  const styles = window.getComputedStyle(element);
  const duration = styles.transitionDuration.split(",")[0] || "0s";
  const delay = styles.transitionDelay.split(",")[0] || "0s";
  return (parseFloat(duration) + parseFloat(delay)) * 1000;
};

const setPanelHeight = (panel) => {
  if (!tabsContent || !panel) return;
  tabsContent.style.height = `${panel.scrollHeight}px`;
};

const updateIndicator = (tab) => {
  if (!tabIndicator || !tabsNav || !tab) return;
  const tabRect = tab.getBoundingClientRect();
  const navRect = tabsNav.getBoundingClientRect();
  tabIndicator.style.width = `${tabRect.width}px`;
  tabIndicator.style.transform = `translateX(${tabRect.left - navRect.left}px)`;
};

const switchTab = (tab, { focus = true } = {}) => {
  if (!tab || tab === activeTab) return;
  const targetId = tab.dataset.tab;
  const nextPanel = document.getElementById(targetId);
  if (!nextPanel) return;

  const previousPanel = activePanel;
  const previousTab = activeTab;

  if (previousTab) {
    previousTab.classList.remove("active");
    previousTab.setAttribute("aria-selected", "false");
  }

  if (previousPanel) {
    previousPanel.classList.remove("active");
    previousPanel.classList.add("is-exiting");
    previousPanel.setAttribute("aria-hidden", "true");
  }

  tab.classList.add("active");
  tab.setAttribute("aria-selected", "true");
  nextPanel.classList.add("active");
  nextPanel.setAttribute("aria-hidden", "false");

  setPanelHeight(nextPanel);
  updateIndicator(tab);

  const exitDuration = getTransitionDuration(previousPanel);
  if (previousPanel) {
    window.setTimeout(() => {
      previousPanel.classList.remove("is-exiting");
    }, exitDuration || 0);
  }

  activeTab = tab;
  activePanel = nextPanel;

  if (focus) {
    tab.focus();
  }
};

if (activePanel) {
  setPanelHeight(activePanel);
}
if (activeTab) {
  updateIndicator(activeTab);
}

window.addEventListener("load", () => {
  setPanelHeight(activePanel);
  updateIndicator(activeTab);
});

window.addEventListener("resize", () => {
  setPanelHeight(activePanel);
  updateIndicator(activeTab);
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => switchTab(tab));
});

// Modal functionality
const modal = document.getElementById("contactModal");
const closeBtn = document.getElementById("closeModal");
const contactForm = document.getElementById("contactForm");
const successMessage = document.getElementById("successMessage");

const focusableSelector =
  "a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])";
let lastFocusedElement = null;

if (modal) {
  modal.setAttribute("aria-hidden", "true");
}

const getFocusableElements = () => {
  if (!modal) return [];
  return Array.from(modal.querySelectorAll(focusableSelector)).filter(
    (el) => !el.hasAttribute("disabled")
  );
};

const openModal = () => {
  if (!modal) return;
  lastFocusedElement = document.activeElement;
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  const focusable = getFocusableElements();
  if (focusable.length) {
    focusable[0].focus();
  }

  document.addEventListener("keydown", handleModalKeydown);
};

const closeModal = () => {
  if (!modal) return;
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  document.removeEventListener("keydown", handleModalKeydown);
  if (contactForm) {
    contactForm.reset();
  }
  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
};

const handleModalKeydown = (event) => {
  if (event.key === "Escape") {
    closeModal();
    return;
  }

  if (event.key !== "Tab") return;

  const focusable = getFocusableElements();
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};

const ctaButtons = [
  document.getElementById("headerCTA"),
  document.getElementById("heroCTA"),
  document.getElementById("tabCTA"),
];

ctaButtons.forEach((btn) => {
  if (btn) {
    btn.addEventListener("click", openModal);
  }
});

if (closeBtn) {
  closeBtn.addEventListener("click", closeModal);
}

if (modal) {
  const overlay = modal.querySelector(".modal__overlay");
  if (overlay) {
    overlay.addEventListener("click", closeModal);
  }
}

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("nameInput").value.trim();
    const email = document.getElementById("emailInput").value.trim();
    const goals = document.getElementById("goalsInput").value.trim();

    if (!name || !email || !goals) {
      alert("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    console.log("Form submitted:", { name, email, goals });

    closeModal();
    if (successMessage) {
      successMessage.classList.add("show");
      setTimeout(() => {
        successMessage.classList.remove("show");
      }, 4000);
    }
  });
}

// "View Approach" button scroll to about section
const approachBtn = document.getElementById("approachBtn");
if (approachBtn) {
  approachBtn.addEventListener("click", () => {
    const aboutTab = document.querySelector('[data-tab="about"]');
    if (aboutTab) {
      switchTab(aboutTab, { focus: false });
    }
  });
}
