/**
 * Simran Design - "Begin Your Project" Multi-Step Questionnaire
 * Simple, human-readable jQuery with descriptive variables and functions.
 */

jQuery(document).ready(function ($) {
  "use strict";

  // 1. Locate the main questionnaire container
  var wizardContainer = $(".begin-your-project-main");

  // Exit if this section is not present on the current page
  if (!wizardContainer.length) {
    return;
  }

  // 2. Cache main jQuery DOM elements
  var allSteps = wizardContainer.find(".q-step");
  var questionSteps = allSteps.filter("[data-key]");

  var stepLabel = $("#q-step-label");
  var progressBar = $("#q-progress");
  var backButton = $("#q-back");
  var summaryList = $("#q-summary");
  var emptySummaryNotice = $("#q-empty");
  var recommendationBox = $("#q-rec");
  var recommendationText = $("#q-rec-text");

  var inputName = $("#q-name");
  var inputBusiness = $("#q-biz");
  var inputPhone = $("#q-tel");
  var inputEmail = $("#q-email");
  var inputLocation = $("#q-town");
  var inputConsent = $("#q-consent");
  var errorMessage = $("#q-error");
  var submitButton = $("#q-submit");

  var thankYouName = $("#q-name-out");
  var sectorCaseStudyLink = $("#q-sector-link");
  var restartButton = $("#q-restart");
  var timeChips = wizardContainer.find(".chip-time");

  // Total steps: 6 questions + 1 contact details step = 7 steps
  var TOTAL_STEPS = 7;

  // 3. Application State
  var currentStepIndex = 0;
  var collectedAnswers = {};
  var selectedCallTime = "";

  /**
   * Determine the recommended package based on user's answers.
   *
   * @param {Object} answers - User's selected answers
   * @returns {string} Recommendation text, or empty string if none
   */
  function calculateRecommendation(answers) {
    if (answers.stage === "Viewing premises" || answers.budget === "Not sure yet") {
      return "Start with The Clarity Review";
    }
    if (answers.service === "Design and full delivery") {
      return "Signature: designed and delivered";
    }
    if (answers.service === "Design only, I have a contractor") {
      return "Full Design package";
    }
    if (answers.service) {
      return "We will advise on your call";
    }
    return "";
  }

  /**
   * Re-render the wizard interface whenever step or answers change.
   */
  function refreshWizardUI() {
    // Show only the step matching the current step index
    allSteps.each(function () {
      var stepNumber = Number($(this).attr("data-step"));
      $(this).toggleClass("is-active", stepNumber === currentStepIndex);
    });

    var isComplete = currentStepIndex >= TOTAL_STEPS;

    // Update progress indicator text
    if (stepLabel.length) {
      if (isComplete) {
        stepLabel.text("Complete");
      } else {
        stepLabel.text("Step " + (currentStepIndex + 1) + " of " + TOTAL_STEPS);
      }
    }

    // Update progress bar width
    if (progressBar.length) {
      var progressPercentage = isComplete
        ? 100
        : Math.round((currentStepIndex / TOTAL_STEPS) * 100);
      progressBar.css("width", progressPercentage + "%");
    }

    // Show Back button only on questions after the first step and before completion
    if (backButton.length) {
      var shouldShowBack = currentStepIndex > 0 && !isComplete;
      backButton.prop("hidden", !shouldShowBack);
    }

    // Build the live summary list in the left panel
    var summaryRowsHtml = "";
    questionSteps.each(function () {
      var questionKey = $(this).attr("data-key");
      var shortLabel = $(this).attr("data-short");
      var selectedValue = collectedAnswers[questionKey];

      if (selectedValue) {
        summaryRowsHtml +=
          '<div style="display:flex;justify-content:space-between;gap:16px;padding:12px 0;border-bottom:1px solid #E3D3C9;font-size:14px">' +
          '<span style="color:#6B5A50">' +
          shortLabel +
          "</span>" +
          '<span style="text-align:right">' +
          selectedValue +
          "</span>" +
          "</div>";
      }
    });

    if (summaryList.length) {
      summaryList.html(summaryRowsHtml);
    }

    // Toggle the placeholder message if no answers are selected yet
    if (emptySummaryNotice.length) {
      var hasAnyAnswers = summaryRowsHtml.length > 0;
      emptySummaryNotice.prop("hidden", hasAnyAnswers);
    }

    // Update the package recommendation box
    var recommendation = calculateRecommendation(collectedAnswers);
    if (recommendationBox.length) {
      recommendationBox.prop("hidden", !recommendation);
    }
    if (recommendationText.length) {
      recommendationText.text(recommendation);
    }

    // Highlight previously selected option buttons when navigating back and forth
    questionSteps.each(function () {
      var questionKey = $(this).attr("data-key");
      var selectedValue = collectedAnswers[questionKey];

      $(this)
        .find(".opt")
        .each(function () {
          var optionValue = $(this).attr("data-value");
          $(this).toggleClass("is-selected", optionValue === selectedValue);
        });
    });
  }

  /**
   * Handle user clicking an answer option button.
   */
  questionSteps.find(".opt").on("click", function () {
    var clickedButton = $(this);
    var parentStep = clickedButton.closest(".q-step");
    var questionKey = parentStep.attr("data-key");
    var chosenValue = clickedButton.attr("data-value");
    var stepNumber = Number(parentStep.attr("data-step"));

    // Save answer and move to the next question
    collectedAnswers[questionKey] = chosenValue;
    currentStepIndex = stepNumber + 1;

    refreshWizardUI();

    // Smoothly scroll back to top of the page for next question
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /**
   * Handle user clicking the "Back" button.
   */
  backButton.on("click", function () {
    if (currentStepIndex > 0) {
      currentStepIndex -= 1;
      refreshWizardUI();
    }
  });

  /**
   * Handle user choosing a preferred call time (Morning, Afternoon, Evening).
   */
  timeChips.on("click", function () {
    var selectedChip = $(this);
    selectedCallTime = selectedChip.attr("data-time") || "";

    // Toggle selected styling
    timeChips.removeClass("is-selected");
    selectedChip.addClass("is-selected");
  });

  /**
   * Handle user submitting their contact details.
   */
  submitButton.on("click", function () {
    var fullName = $.trim(inputName.val());
    var phoneNumber = $.trim(inputPhone.val());
    var emailAddress = $.trim(inputEmail.val());
    var hasConsent = inputConsent.is(":checked");

    // Validation: Name is required, at least one contact method (phone/email), and consent checkbox
    if (!fullName || (!phoneNumber && !emailAddress) || !hasConsent) {
      if (errorMessage.length) {
        errorMessage
          .text("Please add your name, a phone number or email, and tick the consent box.")
          .prop("hidden", false);
      }
      return;
    }

    // Hide error message if valid
    if (errorMessage.length) {
      errorMessage.prop("hidden", true);
    }

    // Prepare lead data payload
    var leadPayload = {
      answers: collectedAnswers,
      preferredTime: selectedCallTime,
      name: fullName,
      business: $.trim(inputBusiness.val()),
      phone: phoneNumber,
      email: emailAddress,
      location: $.trim(inputLocation.val()),
      referralSource: window.location.search,
    };

    console.log("Quote request submitted:", leadPayload);

    // Trigger Facebook Pixel / Google Analytics if installed
    if (typeof window.fbq === "function") {
      window.fbq("track", "Lead");
    }
    if (typeof window.gtag === "function") {
      window.gtag("event", "generate_lead");
    }

    // Personalize the confirmation screen
    var firstName = fullName.split(" ")[0];
    if (thankYouName.length) {
      thankYouName.text(", " + firstName);
    }

    if (sectorCaseStudyLink.length) {
      var sectorName = collectedAnswers.sector;
      var linkText = sectorName
        ? "View " + sectorName.toLowerCase() + " projects"
        : "View case studies";
      sectorCaseStudyLink.text(linkText);
    }

    // Move to final confirmation screen (Step 7)
    currentStepIndex = TOTAL_STEPS;
    refreshWizardUI();

    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /**
   * Handle user clicking "Start again" to restart the questionnaire.
   */
  restartButton.on("click", function () {
    // Reset state variables
    currentStepIndex = 0;
    collectedAnswers = {};
    selectedCallTime = "";

    // Clear form inputs and chip selections
    timeChips.removeClass("is-selected");
    inputName.val("");
    inputBusiness.val("");
    inputPhone.val("");
    inputEmail.val("");
    inputLocation.val("");
    inputConsent.prop("checked", false);

    if (errorMessage.length) {
      errorMessage.prop("hidden", true);
    }

    refreshWizardUI();
  });

  /**
   * Pre-select the sector if provided via URL parameter (e.g., ?sector=salon).
   */
  function prefillFromUrlParameter() {
    var sectorSlugMap = {
      salon: "Salon or barbers",
      clinic: "Clinic or aesthetics",
      office: "Office or workspace",
      hospitality: "Restaurant, café or bar",
      nursery: "Nursery or education",
      wellness: "Gym, studio or spa",
      retail: "Retail or showroom",
    };

    var urlParams = new URLSearchParams(window.location.search);
    var sectorParam = urlParams.get("sector");

    if (sectorParam && sectorSlugMap[sectorParam]) {
      collectedAnswers.sector = sectorSlugMap[sectorParam];
      currentStepIndex = 1;
    }
  }

  // Check URL query parameters and perform initial render
  prefillFromUrlParameter();
  refreshWizardUI();
});
