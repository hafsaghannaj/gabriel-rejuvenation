const tabs = Array.from(document.querySelectorAll(".tab"));
const panels = Array.from(document.querySelectorAll(".panel"));
const tabsNav = document.querySelector(".tabs__nav");
const tabsContent = document.querySelector(".tabs__content");
const tabIndicator = document.querySelector(".tab-indicator");
const tabsSection = document.querySelector(".tabs");
const tabsToggle = document.getElementById("tabsToggle");
const hero = document.querySelector(".hero");
const homePanel = document.getElementById("home");
const heroDesktopParent = hero ? hero.parentElement : null;
const heroDesktopNext = hero ? hero.nextElementSibling : null;

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
  if (tabsSection && tabsSection.classList.contains("tabs--stacked")) {
    tabsContent.style.height = "auto";
    return;
  }
  tabsContent.style.height = `${panel.scrollHeight}px`;
};

const placeHeroForViewport = () => {
  if (!hero || !homePanel || !heroDesktopParent) return;
  const isMobile = window.matchMedia("(max-width: 720px)").matches;
  if (isMobile) {
    if (!homePanel.contains(hero)) {
      homePanel.prepend(hero);
    }
    return;
  }

  if (hero.parentElement !== heroDesktopParent) {
    if (heroDesktopNext && heroDesktopNext.parentElement === heroDesktopParent) {
      heroDesktopParent.insertBefore(hero, heroDesktopNext);
    } else {
      heroDesktopParent.appendChild(hero);
    }
  }
};

const updateMobileTabsLayout = () => {
  if (!tabsSection) return;
  const isMobile = window.matchMedia("(max-width: 720px)").matches;
  if (isMobile) {
    tabsSection.classList.add("tabs--stacked");
    tabs.forEach((tab) => {
      const targetId = tab.dataset.tab;
      const panel = document.getElementById(targetId);
      if (!panel) return;
      if (["home", "about", "services", "approach", "plans", "payment", "contact"].includes(targetId)) {
        const existing = panel.querySelector(".panel__mobile-title");
        if (existing) {
          existing.remove();
        }
        return;
      }
      if (!panel.querySelector(".panel__mobile-title")) {
        const heading = document.createElement("h2");
        heading.className = "panel__mobile-title";
        heading.textContent = tab.textContent.trim();
        panel.prepend(heading);
      }
    });
    if (tabsContent) {
      tabsContent.style.height = "auto";
    }
  } else {
    tabsSection.classList.remove("tabs--stacked");
    document.querySelectorAll(".panel__mobile-title").forEach((title) => {
      title.remove();
    });
  }
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
placeHeroForViewport();

window.addEventListener("load", () => {
  placeHeroForViewport();
  updateMobileTabsLayout();
  setPanelHeight(activePanel);
  updateIndicator(activeTab);
});

window.addEventListener("resize", () => {
  placeHeroForViewport();
  updateMobileTabsLayout();
  setPanelHeight(activePanel);
  updateIndicator(activeTab);
  if (tabsSection && !window.matchMedia("(max-width: 720px)").matches) {
    tabsSection.classList.remove("tabs--collapsed");
  }
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    switchTab(tab);
    if (tab.dataset.tab === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (tabsSection) {
      tabsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    const isMobile = window.matchMedia("(max-width: 720px)").matches;
    if (isMobile && tabsSection && tab.dataset.tab !== "home") {
      tabsSection.classList.add("tabs--collapsed");
    }
  });
});

if (tabsToggle && tabsSection) {
  tabsToggle.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    tabsSection.classList.remove("tabs--collapsed");
  });
}

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
  document.getElementById("heroVisualCTA"),
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

// Service button click handlers
const serviceButtons = document.querySelectorAll(".service-btn");
serviceButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const serviceId = btn.dataset.service;
    const servicePanel = document.getElementById(serviceId);
    if (servicePanel) {
      switchTab({ dataset: { tab: serviceId } });
      const tabsSection = document.querySelector(".tabs");
      if (tabsSection) {
        tabsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });
});

// Expertise button click handlers
const expertiseButtons = document.querySelectorAll(".expertise-btn");
expertiseButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const expertiseId = btn.dataset.expertise;
    const expertisePanel = document.getElementById(expertiseId);
    if (expertisePanel) {
      switchTab({ dataset: { tab: expertiseId } });
      const tabsSection = document.querySelector(".tabs");
      if (tabsSection) {
        tabsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });
});

// Payment option button click handlers
const paymentButtons = document.querySelectorAll(".payment-btn");
paymentButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const paymentId = btn.dataset.payment;
    const paymentPanel = document.getElementById(paymentId);
    if (paymentPanel) {
      switchTab({ dataset: { tab: paymentId } });
      const tabsSection = document.querySelector(".tabs");
      if (tabsSection) {
        tabsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });
});

// E-book modal functionality
const ebookModal = document.getElementById("ebookModal");
const closeEbookBtn = document.getElementById("closeEbookModal");
const ebookForm = document.getElementById("ebookForm");
const ebookButtons = document.querySelectorAll(".ebook-btn");

if (ebookModal) {
  ebookModal.setAttribute("aria-hidden", "true");
}

const openEbookModal = (ebookName, ebookId) => {
  if (!ebookModal) return;
  lastFocusedElement = document.activeElement;
  ebookModal.classList.add("active");
  ebookModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  document.getElementById("ebookSelected").value = ebookName;

  const focusable = Array.from(ebookModal.querySelectorAll(focusableSelector)).filter(
    (el) => !el.hasAttribute("disabled")
  );
  if (focusable.length) {
    focusable[0].focus();
  }

  document.addEventListener("keydown", handleEbookModalKeydown);
};

const closeEbookModal = () => {
  if (!ebookModal) return;
  ebookModal.classList.remove("active");
  ebookModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  document.removeEventListener("keydown", handleEbookModalKeydown);
  if (ebookForm) {
    ebookForm.reset();
  }
  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
};

const handleEbookModalKeydown = (event) => {
  if (event.key === "Escape") {
    closeEbookModal();
    return;
  }

  if (event.key !== "Tab") return;

  const focusable = Array.from(ebookModal.querySelectorAll(focusableSelector)).filter(
    (el) => !el.hasAttribute("disabled")
  );
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

ebookButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const ebookName = btn.dataset.ebook;
    openEbookModal(ebookName);
  });
});

if (closeEbookBtn) {
  closeEbookBtn.addEventListener("click", closeEbookModal);
}

if (ebookModal) {
  const overlay = ebookModal.querySelector(".modal__overlay");
  if (overlay) {
    overlay.addEventListener("click", closeEbookModal);
  }
}

if (ebookForm) {
  ebookForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("ebookNameInput").value.trim();
    const email = document.getElementById("ebookEmailInput").value.trim();
    const selected = document.getElementById("ebookSelected").value.trim();

    if (!name || !email) {
      alert("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    console.log("E-book purchased:", { name, email, ebook: selected });

    closeEbookModal();
    if (successMessage) {
      successMessage.classList.add("show");
      setTimeout(() => {
        successMessage.classList.remove("show");
      }, 4000);
    }
  });
}

// "View Approach" button navigate to approach tab
const approachBtn = document.getElementById("approachBtn");
if (approachBtn) {
  approachBtn.addEventListener("click", () => {
    const approachTab = document.querySelector('[data-tab="approach"]');
    if (approachTab) {
      switchTab(approachTab, { focus: false });
    }
    const tabsSection = document.querySelector(".tabs");
    if (tabsSection) {
      tabsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}
