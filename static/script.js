"use strict";


/* =========================
   USTAWIENIA
========================= */

const STORAGE_KEY_PREFIX = "justPackItItemsV7-";
function getStorageKey(hospitalName) {
    return (
        STORAGE_KEY_PREFIX +
        encodeURIComponent(
            hospitalName || "Szpital Ujastek"
        )
    );
}
const PROFILE_STORAGE_KEY = "justPackItProfileV1";

const hospitalLists =
    window.HOSPITAL_LISTS &&
    typeof window.HOSPITAL_LISTS === "object"
        ? window.HOSPITAL_LISTS
        : {};
const hospitalInfo =
    window.HOSPITAL_INFO &&
    typeof window.HOSPITAL_INFO === "object"
        ? window.HOSPITAL_INFO
        : {};

function getInitialItemsForHospital(hospitalName) {

    if (hospitalName === "Inny szpital") {
        return [];
    }

    const selectedList = hospitalLists[hospitalName];

    if (Array.isArray(selectedList)) {
        return selectedList;
    }

    if (Array.isArray(window.INITIAL_ITEMS)) {
        return window.INITIAL_ITEMS;
    }

    return [];
}


/* =========================
   ELEMENTY STRONY
========================= */

const addItemForm = document.getElementById("add-item-form");
const itemNameInput = document.getElementById("item-name");
const itemCategorySelect = document.getElementById("item-category");
const categoryButtons = document.querySelectorAll(".category-option");

const documentsList = document.getElementById("documents-list");
const motherList = document.getElementById("mother-list");
const babyList = document.getElementById("baby-list");
const fatherList = document.getElementById("father-list");
const cesareanList = document.getElementById("cesarean-list");
const cesareanSection = document.getElementById("cesarean-section");
const cesareanCategoryOption = document.getElementById("cesarean-category-option");
const heroSubtitle = document.getElementById("hero-subtitle");

const progressDescription = document.getElementById(
    "progress-description"
);

const progressPercent = document.getElementById(
    "progress-percent"
);

const progressBar = document.getElementById(
    "progress-bar"
);

const progressBarFill = document.getElementById(
    "progress-bar-fill"
);

const progressComplete = document.getElementById(
    "progress-complete"
);

const confettiContainer = document.getElementById(
    "confetti-container"
);

const resetListButton = document.getElementById(
    "reset-list-btn"
);

const printListButton = document.getElementById(
    "print-list-btn"
);

const packingWizard = document.getElementById(
    "packing-wizard"
);

const wizardForm = document.getElementById(
    "wizard-form"
);

const dueDateInput = document.getElementById(
    "due-date"
);

const pregnancyCalculation = document.getElementById(
    "pregnancy-calculation"
);

const correctedWeekInput = document.getElementById(
    "corrected-week"
);

const correctedDayInput = document.getElementById(
    "corrected-day"
);

const savePregnancyCorrectionButton =
    document.getElementById(
        "save-pregnancy-correction"
    );

const removePregnancyCorrectionButton =
    document.getElementById(
        "remove-pregnancy-correction"
    );

const hospitalNameSelect = document.getElementById(
    "hospital-name"
);

const hospitalSearchInput =
    document.getElementById("hospital-search");

const packingApp = document.getElementById(
    "packing-app"
);

const profileSummaryMessage = document.getElementById(
    "profile-summary-message"
);
const midwifeTip = document.getElementById("midwife-tip");
const midwifeTipTitle = document.getElementById("midwife-tip-title");
const midwifeTipText = document.getElementById("midwife-tip-text");

const editProfileButton = document.getElementById(
    "edit-profile-btn"
);
const hospitalProvidedCard = document.getElementById("hospital-provided-card");

const hospitalProvidedList = document.getElementById("hospital-provided-list");

const hospitalFactsCard =
    document.getElementById("hospital-facts-card");

const hospitalFactsList =
    document.getElementById("hospital-facts-list");

const hospitalFactsSource =
    document.getElementById("hospital-facts-source");

const profilePregnancyWeek =
    document.getElementById(
        "profile-pregnancy-week"
    );

const profileDueDate =
    document.getElementById(
        "profile-due-date"
    );

const profileHospital =
    document.getElementById(
        "profile-hospital"
    );

const hospitalSourceNote =
    document.getElementById(
        "hospital-source-note"
    );

const pregnancyProgress =
    document.getElementById(
        "pregnancy-progress"
    );

const pregnancyProgressBar =
    document.getElementById(
        "pregnancy-progress-bar"
    );

const pregnancyProgressPercent =
    document.getElementById(
        "pregnancy-progress-percent"
    );

const pregnancyProgressText =
    document.getElementById(
        "pregnancy-progress-text"
    );
const otherHospitalNote =document.getElementById("other-hospital-note");

/* =========================
   WYSZUKIWANIE SZPITALA
========================= */

const originalHospitalOptions =
    hospitalNameSelect
        ? Array.from(hospitalNameSelect.options).map(function (option) {
            return {
                value: option.value,
                text: option.textContent,
                disabled: option.disabled
            };
        })
        : [];


function normalizeHospitalSearch(text) {
    return String(text || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}


function filterHospitals() {
    if (!hospitalNameSelect || !hospitalSearchInput) {
        return;
    }

    const searchValue =
        normalizeHospitalSearch(hospitalSearchInput.value);

    const previouslySelectedValue =
        hospitalNameSelect.value;

    hospitalNameSelect.innerHTML = "";

    originalHospitalOptions.forEach(function (hospital) {

        const normalizedText =
            normalizeHospitalSearch(hospital.text);

        const normalizedValue =
            normalizeHospitalSearch(hospital.value);

        const isPlaceholder =
            hospital.value === "";

        const isOtherHospital =
            hospital.value === "Inny szpital";

        const matchesSearch =
            searchValue === "" ||
            normalizedText.includes(searchValue) ||
            normalizedValue.includes(searchValue);

        if (
            isPlaceholder ||
            isOtherHospital ||
            matchesSearch
        ) {
            const option =
                document.createElement("option");

            option.value = hospital.value;
            option.textContent = hospital.text;
            option.disabled = hospital.disabled;

            hospitalNameSelect.appendChild(option);
        }
    });

    const selectedOptionStillExists =
        Array.from(hospitalNameSelect.options).some(
            function (option) {
                return option.value === previouslySelectedValue;
            }
        );

    if (selectedOptionStillExists) {
        hospitalNameSelect.value =
            previouslySelectedValue;
    }
}


if (hospitalSearchInput) {
    hospitalSearchInput.addEventListener(
        "input",
        filterHospitals
    );
}

// =============================
// OBLICZANIE TYGODNIA CIĄŻY
// =============================

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const FULL_PREGNANCY_DAYS = 280;

function parseLocalDate(dateString) {
    if (!dateString) {
        return null;
    }

    const [year, month, day] = dateString
        .split("-")
        .map(Number);

    return new Date(year, month - 1, day);
}

function getTodayAtMidnight() {
    const today = new Date();

    return new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );
}

function calculatePregnancyDay(dueDateString) {
    const dueDate = parseLocalDate(dueDateString);

    if (!dueDate) {
        return null;
    }

    const today = getTodayAtMidnight();

    const daysUntilDueDate = Math.round(
        (dueDate.getTime() - today.getTime()) / DAY_IN_MS
    );

    return FULL_PREGNANCY_DAYS - daysUntilDueDate;
}

function pregnancyDayToProgress(pregnancyDay) {
    if (pregnancyDay === null) {
        return null;
    }

    const safePregnancyDay = Math.max(
        0,
        Math.min(pregnancyDay, 42 * 7 + 6)
    );

    return {
        week: Math.floor(safePregnancyDay / 7),
        day: safePregnancyDay % 7
    };
}

function getCurrentPregnancyProgress() {
    if (!userProfile || !userProfile.dueDate) {
        return null;
    }

    const calculatedPregnancyDay =
        calculatePregnancyDay(userProfile.dueDate);

    if (calculatedPregnancyDay === null) {
        return null;
    }

    const adjustmentDays =
        Number(userProfile.pregnancyAdjustmentDays) || 0;

    return pregnancyDayToProgress(
        calculatedPregnancyDay + adjustmentDays
    );
}

function getDaysUntilDueDate() {
    if (!userProfile || !userProfile.dueDate) {
        return null;
    }

    const dueDate = parseLocalDate(userProfile.dueDate);
    const today = getTodayAtMidnight();

    return Math.round(
        (dueDate.getTime() - today.getTime()) / DAY_IN_MS
    );
}

function renderPregnancyCalculation() {
    if (!pregnancyCalculation) {
        return;
    }

    const progress = getCurrentPregnancyProgress();

    if (!progress) {
        pregnancyCalculation.hidden = true;
        pregnancyCalculation.textContent = "";
        return;
    }

    const daysUntilDueDate = getDaysUntilDueDate();

    pregnancyCalculation.hidden = false;

    let message =
        "Aktualnie: " +
        progress.week +
        " tyg. + " +
        progress.day +
        " dni.";

    if (daysUntilDueDate > 0) {
        message +=
            " Do planowanego terminu pozostało " +
            daysUntilDueDate +
            " dni.";
    } else if (daysUntilDueDate === 0) {
        message +=
            " Planowany termin porodu przypada dzisiaj.";
    } else if (daysUntilDueDate < 0) {
        message +=
            " Planowany termin minął " +
            Math.abs(daysUntilDueDate) +
            " dni temu.";
    }

    pregnancyCalculation.textContent = message;
}

/* =========================
   PROFIL I KREATOR LISTY
========================= */

function saveProfile(profileToSave) {
    localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(profileToSave)
    );
}


function loadProfile() {
    const savedProfile = localStorage.getItem(
        PROFILE_STORAGE_KEY
    );

    if (!savedProfile) {
        return null;
    }

    try {
        const parsedProfile = JSON.parse(savedProfile);

        if (
            typeof parsedProfile !== "object" ||
            parsedProfile === null
        ) {
            return null;
        }

        return parsedProfile;
    } catch (error) {
        console.error(
            "Nie udało się odczytać profilu:",
            error
        );

        return null;
    }
}


let userProfile = loadProfile();

if (
    userProfile &&
    !userProfile.dueDate
) {
    userProfile = null;
}


function getDeliveryTypeLabel(deliveryType) {
    if (deliveryType === "naturalny") {
        return "poród naturalny";
    }

    if (deliveryType === "cesarskie-ciecie") {
        return "cesarskie cięcie";
    }

    return "rodzaj porodu jeszcze nieustalony";
}

function getHospitalNameInGenitive(hospitalName) {
    const hospitalNames = {
        "Szpital Ujastek":
            "Szpitala Ujastek",

        "Szpital Żeromski":
            "Szpitala Żeromskiego",

        "Szpital Siemiradzkiego":
            "Szpitala Siemiradzkiego",

        "Szpital Uniwersytecki":
            "Szpitala Uniwersyteckiego",

        "Szpital Rydygiera":
            "Szpitala Rydygiera",

        "Szpital Narutowicza":
            "Szpitala Narutowicza",

        "Wojewódzki Szpital Specjalistyczny we Wrocławiu":
            "Wojewódzkiego Szpitala Specjalistycznego we Wrocławiu",

        "Szpital Matki Bożej Nieustającej Pomocy w Wołominie":
            "Szpitala Matki Bożej Nieustającej Pomocy w Wołominie",

        "Międzyleski Szpital Specjalistyczny w Warszawie":
            "Międzyleskiego Szpitala Specjalistycznego w Warszawie",

        "Rodzinna Strefa Narodzin w Skarżysku-Kamiennej":
            "Rodzinnej Strefy Narodzin w Skarżysku-Kamiennej",

        "Instytut Centrum Zdrowia Matki Polki w Łodzi":
            "Instytutu Centrum Zdrowia Matki Polki w Łodzi",

        "Szpital Wojewódzki w Poznaniu":
            "Szpitala Wojewódzkiego w Poznaniu",

        "Szpital Specjalistyczny w Kościerzynie":
            "Szpitala Specjalistycznego w Kościerzynie",

        "Uniwersytecki Szpital Kliniczny we Wrocławiu":
            "Uniwersyteckiego Szpitala Klinicznego we Wrocławiu",

        "Szpital Specjalistyczny PRO-FAMILIA w Rzeszowie":
            "Szpitala Specjalistycznego PRO-FAMILIA w Rzeszowie",

        "Wojewódzki Szpital w Tarnobrzegu":
            "Wojewódzkiego Szpitala w Tarnobrzegu",

        "Powiatowy Szpital Specjalistyczny w Stalowej Woli":
            "Powiatowego Szpitala Specjalistycznego w Stalowej Woli",

        "Szpital Wielospecjalistyczny w Gliwicach":
            "Szpitala Wielospecjalistycznego w Gliwicach",

        "Powiatowe Centrum Zdrowia w Malborku":
            "Powiatowego Centrum Zdrowia w Malborku",

        "Szpital im. Św. Jadwigi Śląskiej w Trzebnicy":
            "Szpitala im. Św. Jadwigi Śląskiej w Trzebnicy",

        "Szpital Specjalistyczny św. Zofii w Warszawie":
            "Szpitala Specjalistycznego św. Zofii w Warszawie",

        "Wojewódzki Szpital Specjalistyczny w Lublinie":
            "Wojewódzkiego Szpitala Specjalistycznego w Lublinie",

        "Wojewódzki Szpital Specjalistyczny im. Janusza Korczaka w Słupsku":
            "Wojewódzkiego Szpitala Specjalistycznego im. Janusza Korczaka w Słupsku",

        "Kliniczne Centrum Ginekologii, Położnictwa i Neonatologii w Opolu":
            "Klinicznego Centrum Ginekologii, Położnictwa i Neonatologii w Opolu",


        "Mazowiecki Szpital Bródnowski w Warszawie":
            "Mazowieckiego Szpitala Bródnowskiego w Warszawie",

        "Wojewódzki Szpital Specjalistyczny im. NMP w Częstochowie":
            "Wojewódzkiego Szpitala Specjalistycznego im. NMP w Częstochowie",

        "Szpital im. Rudolfa Weigla w Blachowni":
            "Szpitala im. Rudolfa Weigla w Blachowni",

        "Giżycka Ochrona Zdrowia":
            "Giżyckiej Ochrony Zdrowia",

        "Szpital Joannitas w Pszczynie":
            "Szpitala Joannitas w Pszczynie",

        "Szpital Powiatowy w Oświęcimiu":
            "Szpitala Powiatowego w Oświęcimiu",

        "Centralny Szpital Kliniczny UM w Łodzi":
            "Centralnego Szpitala Klinicznego UM w Łodzi",

        "Warszawski Szpital Południowy":
            "Warszawskiego Szpitala Południowego",

        "COPERNICUS – Szpital św. Wojciecha (Zaspa)":
            "Szpitala św. Wojciecha (Zaspa) w Gdańsku",

        "Uniwersyteckie Centrum Kliniczne GUMed (UCK)":
            "Uniwersyteckiego Centrum Klinicznego GUMed (UCK) w Gdańsku",

        "MSWiA w Bydgoszczy": "MSWiA w Bydgoszczy",

        "Szpital Uniwersytecki nr 2 im. dr. Jana Biziela w Bydgoszczy":
            "Szpitala Uniwersyteckiego nr 2 im. dr. Jana Biziela w Bydgoszczy",

        "Wojewódzki Szpital Specjalistyczny w Legnicy":
            "Wojewódzkiego Szpitala Specjalistycznego w Legnicy",

        "Wojewódzki Szpital Zespolony w Kielcach":
            "Wojewódzkiego Szpitala Zespolonego w Kielcach",

        "Szpital Specjalistyczny w Jaśle": "Szpitala Specjalistycznego w Jaśle",

        "Regionalny Szpital w Kołobrzegu": "Regionalnego Szpitala w Kołobrzegu",

        "Uniwersytecki Szpital Kliniczny nr 2 PUM w Szczecinie":
            "Uniwersyteckiego Szpitala Klinicznego nr 2 PUM w Szczecinie",

        "Wojewódzki Szpital Zespolony im. Ludwika Perzyny w Kaliszu":
            "Wojewódzkiego Szpitala Zespolonego im. Ludwika Perzyny w Kaliszu",

        "Centrum Zdrowia Tuchów":
            "Centrum Zdrowia Tuchów",

        "Szpital Powiatowy im. bł. Marty Wieckiej w Bochni":
            "Szpitala Powiatowego im. bł. Marty Wieckiej w Bochni",

        "Szpital Kliniczny im. ks. Anny Mazowieckiej – Karowa 2, Warszawa":
            "Szpitala Klinicznego im. ks. Anny Mazowieckiej – Karowa 2 w Warszawie",

        "Szpital Położniczo-Ginekologiczny Medikor w Nowym Sączu":
            "Szpitala Położniczo-Ginekologicznego Medikor w Nowym Sączu",

        "Szpital Powiatowy w Dzierżoniowie":
            "Szpitala Powiatowego w Dzierżoniowie",
    };

    return hospitalNames[hospitalName] || hospitalName;
}


function getPregnancyMessage(week) {
    if (week < 28) {
        return (
            "Masz jeszcze trochę czasu, ale możesz już spokojnie " +
            "zacząć kompletować potrzebne rzeczy."
        );
    }

    if (week < 32) {
        return (
            "To dobry moment, żeby rozpocząć pakowanie torby " +
            "bez pośpiechu i wybrać położną środowiskową."
        );
    }

    if (week < 36) {
        return (
            "Czas się spakować — warto mieć już większość " +
            "potrzebnych rzeczy gotowych. To także dobry moment, " +
            "żeby upewnić się, że masz wybraną położną środowiskową."
        );
    }

    return (
        "Torba powinna być już gotowa i ustawiona " +
        "w łatwo dostępnym miejscu."
    );
}

function renderProfileSummary() {
    console.log(userProfile);
    if (!userProfile) {
        return;
    }

    const progress = getCurrentPregnancyProgress();

    if (!progress) {
        return;
    }

    const week = progress.week;
    const day = progress.day;

    const deliveryLabel = getDeliveryTypeLabel(
        userProfile.deliveryType
    );

    if (profilePregnancyWeek) {
        profilePregnancyWeek.textContent =
            week +
            " tyg. + " +
            day +
            " dni";
    }
    const pregnancyDay =
    Math.max(
        0,
        Math.min(
            week * 7 + day,
            FULL_PREGNANCY_DAYS
        )
    );

    const pregnancyPercent =
        Math.round(
            (pregnancyDay / FULL_PREGNANCY_DAYS) * 100
        );

    const daysUntilDueDate =
        getDaysUntilDueDate();

    if (pregnancyProgressBar) {
        pregnancyProgressBar.style.width =
            pregnancyPercent + "%";
    }

    if (pregnancyProgressPercent) {
        pregnancyProgressPercent.textContent =
            pregnancyPercent + "%";
    }

    if (pregnancyProgress) {
        pregnancyProgress.setAttribute(
            "aria-valuenow",
            String(pregnancyPercent)
        );
    }

    if (pregnancyProgressText) {
        if (daysUntilDueDate > 1) {
            pregnancyProgressText.textContent =
                "Do planowanego terminu pozostało " +
                daysUntilDueDate +
                " dni.";
        } else if (daysUntilDueDate === 1) {
            pregnancyProgressText.textContent =
                "Do planowanego terminu pozostał 1 dzień.";
        } else if (daysUntilDueDate === 0) {
            pregnancyProgressText.textContent =
                "Planowany termin porodu przypada dzisiaj 🤍";
        } else {
            pregnancyProgressText.textContent =
                "Planowany termin porodu już minął.";
        }
    }

    const dueDate = parseLocalDate(
        userProfile.dueDate
    );

    let formattedDueDate = "Nie podano";

    if (
        dueDate &&
        !Number.isNaN(dueDate.getTime())
    ) {
        formattedDueDate =
            dueDate.toLocaleDateString(
                "pl-PL",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );
    }

if (profileDueDate) {
    profileDueDate.textContent =
        formattedDueDate;
}

if (profileHospital) {
    profileHospital.textContent =
        userProfile.hospitalName
            ? getHospitalNameInGenitive(userProfile.hospitalName)
            : "Nie wybrano";
}

if (hospitalSourceNote) {
    hospitalSourceNote.hidden =
        userProfile.hospitalName !==
        "Instytut Centrum Zdrowia Matki Polki w Łodzi";
}

if (otherHospitalNote) {
    otherHospitalNote.hidden =
        userProfile.hospitalName !== "Inny szpital";
}

  profileSummaryMessage.textContent =
    getPregnancyMessage(week) +
    " Planowany rodzaj porodu: " +
    deliveryLabel +
    ".";

    if (heroSubtitle) {
        if (
            userProfile.hospitalName ===
            "Inny szpital"
        ) {
            heroSubtitle.textContent =
                "Twoja interaktywna lista do pakowania";
        } else {
            heroSubtitle.textContent =
                "Twoja interaktywna lista do pakowania " +
                "opracowana na podstawie zaleceń " +
                 getHospitalNameInGenitive(userProfile.hospitalName);
        }
    }

    if (
        midwifeTip &&
        midwifeTipTitle &&
        midwifeTipText
    ) {
        if (week < 20) {
            midwifeTip.hidden = true;
        } else {
            midwifeTip.hidden = false;

            if (week < 32) {
                midwifeTipTitle.textContent =
                    "💡 To dobry moment";

                midwifeTipText.textContent =
                    "✅ Warto już wybrać położną środowiskową.";
            } else {
                midwifeTipTitle.textContent =
                    "💡 Pamiętaj";

                midwifeTipText.textContent =
                    "✅ Jeśli jeszcze nie masz wybranej " +
                    "położnej środowiskowej, warto zrobić to teraz.";
            }
        }
    }
}
function fillWizardWithProfile() {
    if (!userProfile) {
        return;
    }

    dueDateInput.value =
        userProfile.dueDate || "";

    hospitalNameSelect.value =
        userProfile.hospitalName || "";

    const deliveryRadio = document.querySelector(
        'input[name="delivery-type"][value="' +
        userProfile.deliveryType +
        '"]'
    );

    if (deliveryRadio) {
        deliveryRadio.checked = true;
    }

    renderPregnancyCalculation();
}

function showWizard() {
    fillWizardWithProfile();

    packingWizard.hidden = false;
    packingApp.hidden = true;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function showPackingApp() {
    packingWizard.hidden = true;
    packingApp.hidden = false;

    renderProfileSummary();
    renderApp();
}

/* =========================
   LOCAL STORAGE
========================= */

function copyInitialItems(hospitalName) {
    const initialItems =
        getInitialItemsForHospital(hospitalName);

    return initialItems.map(function (item) {
        return {
            id: item.id,
            nazwa: item.nazwa,
            kategoria: item.kategoria,
            spakowane: false,
            przypiete: item.przypiete === true
        };
    });
}


function saveItems(itemsToSave) {
    const hospitalName = userProfile
        ? userProfile.hospitalName
        : "Szpital Ujastek";

    localStorage.setItem(
        getStorageKey(hospitalName),
        JSON.stringify(itemsToSave)
    );
}


function loadItems() {
    const hospitalName = userProfile
            ? userProfile.hospitalName
            : "Szpital Ujastek";

    const savedItems = localStorage.getItem(
        getStorageKey(hospitalName)
    );

    if (!savedItems) {
        const freshItems = copyInitialItems(hospitalName);
        saveItems(freshItems);
        return freshItems;
    }

    try {
        const parsedItems = JSON.parse(savedItems);

        if (!Array.isArray(parsedItems)) {
            throw new Error(
                "Zapisana lista nie jest tablicą."
            );
        }

        return parsedItems.map(function (item) {
            return {
                id: item.id,
                nazwa: item.nazwa,
                kategoria: item.kategoria,
                spakowane: item.spakowane === true,
                wlasny: item.wlasny === true,
                przypiete: item.przypiete === true
            };
        });
    } catch (error) {
        console.error(
            "Nie udało się odczytać listy:",
            error
        );

        const freshItems = copyInitialItems(hospitalName);
        saveItems(freshItems);

        return freshItems;
    }
}


let items = loadItems();


/* =========================
   TWORZENIE ELEMENTU LISTY
========================= */

function createItemRow(item) {
    const row = document.createElement("div");
    row.className = "item-row";

    if (item.spakowane) {
        row.classList.add("checked");
    }
    if (item.przypiete) {
        row.classList.add("pinned");
    }

    const checkboxButton = document.createElement("button");
    checkboxButton.type = "button";
    checkboxButton.className = "checkbox-btn";
    checkboxButton.textContent = item.spakowane
        ? "✅"
        : "⭕";

    checkboxButton.setAttribute(
        "aria-label",
        item.spakowane
            ? "Oznacz " + item.nazwa + " jako niespakowane"
            : "Oznacz " + item.nazwa + " jako spakowane"
    );

    checkboxButton.addEventListener(
        "click",
        function () {
            toggleItem(item.id);
        }
    );

    const itemName = document.createElement("span");
    itemName.className = "item-name";
    itemName.textContent = item.nazwa;

    const pinButton = document.createElement("button");
    pinButton.type = "button";
    pinButton.className = "pin-btn";

    if (item.przypiete) {
        pinButton.classList.add("active");
    }

    pinButton.textContent = "📌";

    pinButton.setAttribute(
        "aria-label",
        item.przypiete
            ? "Odepnij " + item.nazwa
            : "Przypnij " + item.nazwa + " jako ważne"
    );

    pinButton.setAttribute(
        "title",
        item.przypiete
            ? "Odepnij"
            : "Przypnij jako ważne"
    );

    pinButton.addEventListener(
        "click",
        function () {
            togglePinned(item.id);
        }
    );

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "❌";

    deleteButton.setAttribute(
        "aria-label",
        "Usuń " + item.nazwa
    );

    deleteButton.addEventListener(
        "click",
        function () {
            deleteItem(item.id);
        }
    );

    row.appendChild(checkboxButton);
    row.appendChild(itemName);
    row.appendChild(pinButton);
    row.appendChild(deleteButton);

    return row;
}


/* =========================
   RENDEROWANIE KATEGORII
========================= */

function renderCategory(category, container) {
    container.innerHTML = "";

    const categoryItems = items
        .filter(function (item) {
            return item.kategoria === category;
        })
        .sort(function (firstItem, secondItem) {
            if (
                firstItem.przypiete === true &&
                secondItem.przypiete !== true
            ) {
                return -1;
            }

            if (
                firstItem.przypiete !== true &&
                secondItem.przypiete === true
            ) {
                return 1;
            }

            return 0;
        });

    if (categoryItems.length === 0) {
        const emptyMessage = document.createElement("p");

        emptyMessage.className = "empty-category";
        emptyMessage.textContent =
            "Brak elementów w tej kategorii.";

        container.appendChild(emptyMessage);
        return;
    }

    categoryItems.forEach(
        function (item) {
            const row = createItemRow(item);
            container.appendChild(row);
        }
    );
}


/* =========================
   PASEK POSTĘPU
========================= */

function launchConfetti() {
    const confettiColors = [
        "#bcc9b7",
        "#d9c79e",
        "#e8b9ad",
        "#aabca6",
        "#f1d9a7"
    ];

    confettiContainer.innerHTML = "";

    for (let index = 0; index < 28; index += 1) {
        const piece = document.createElement("span");

        piece.className = "confetti-piece";

        piece.style.left =
            Math.random() * 100 + "%";

        piece.style.backgroundColor =
            confettiColors[
                Math.floor(
                    Math.random() * confettiColors.length
                )
            ];

        piece.style.animationDelay =
            Math.random() * 0.45 + "s";

        piece.style.animationDuration =
            1.4 + Math.random() * 0.8 + "s";

        piece.style.transform =
            "rotate(" + Math.random() * 360 + "deg)";

        confettiContainer.appendChild(piece);
    }

    window.setTimeout(function () {
        confettiContainer.innerHTML = "";
    }, 2600);
}

let previousPercent = null;

function getVisibleItems() {
    if (shouldShowCesareanSection()) {
        return items;
    }

    return items.filter(function (item) {
        return item.kategoria !== "Cesarskie cięcie";
    });
}

function renderProgress() {
    const visibleItems = getVisibleItems();
    const total = visibleItems.length;

    const packed = visibleItems.filter(
        function (item) {
            return item.spakowane === true;
        }
    ).length;

    const percent = total > 0
        ? Math.round((packed / total) * 100)
        : 0;

    progressDescription.textContent =
        packed + " z " + total + " rzeczy spakowanych";

    progressPercent.textContent =
        percent + "%";

    progressBarFill.style.width =
        percent + "%";

    progressBar.setAttribute(
        "aria-valuenow",
        String(percent)
    );

    const isComplete =
        percent === 100 && total > 0;

    progressComplete.hidden = !isComplete;

    if (
        isComplete &&
        previousPercent !== null &&
        previousPercent < 100
    ) {
        progressComplete.classList.remove("celebrate");

        void progressComplete.offsetWidth;

        progressComplete.classList.add("celebrate");

        launchConfetti();
    }

    if (!isComplete) {
        progressComplete.classList.remove("celebrate");
    }

    previousPercent = percent;
}


/* =========================
   RENDEROWANIE APLIKACJI
========================= */

function shouldShowCesareanSection() {
    if (!userProfile) {
        return false;
    }

    return (
        userProfile.deliveryType === "cesarskie-ciecie" ||
        userProfile.deliveryType === "nie-wiem"
    );
}


function renderCesareanSection() {
    const isVisible = shouldShowCesareanSection();

    if (cesareanSection) {
        cesareanSection.hidden = !isVisible;
    }

    if (cesareanCategoryOption) {
        cesareanCategoryOption.hidden = !isVisible;
        cesareanCategoryOption.disabled = !isVisible;
    }

    if (isVisible && cesareanList) {
        renderCategory(
            "Cesarskie cięcie",
            cesareanList
        );

        if (
            userProfile &&
            userProfile.hospitalName ===
                "Wojewódzki Szpital Specjalistyczny we Wrocławiu"
        ) {
            const info = document.createElement("p");

            info.className = "cesarean-hospital-info";

            info.textContent =
                "ℹ️ Szpital nie publikuje osobnej wyprawki do planowanego " +
                "cięcia cesarskiego. Dodatkowe pozycje pochodzą z informacji " +
                "dotyczących planowego przyjęcia do szpitala.";

            cesareanList.prepend(info);
        }

    } else if (
        itemCategorySelect &&
        itemCategorySelect.value === "Cesarskie cięcie"
    ) {
        setActiveCategory("Dokumenty");
    }
}

function renderHospitalProvidedInfo() {
    if (
        !hospitalProvidedCard ||
        !hospitalProvidedList ||
        !userProfile
    ) {
        return;
    }

    hospitalProvidedList.innerHTML = "";

    const selectedHospitalInfo =
        hospitalInfo[userProfile.hospitalName];

    const providedItems =
        selectedHospitalInfo &&
        Array.isArray(selectedHospitalInfo.zapewnia)
            ? selectedHospitalInfo.zapewnia
            : [];

    if (providedItems.length === 0) {
        hospitalProvidedCard.hidden = true;
        return;
    }

    providedItems.forEach(function (item) {
        const listItem = document.createElement("li");
        listItem.textContent = item;
        hospitalProvidedList.appendChild(listItem);
    });

    hospitalProvidedCard.hidden = false;
}

function renderHospitalFacts() {
    if (
        !hospitalFactsCard ||
        !hospitalFactsList ||
        !userProfile
    ) {
        return;
    }

    hospitalFactsList.innerHTML = "";

    if (hospitalFactsSource) {
        hospitalFactsSource.textContent = "";
        hospitalFactsSource.hidden = true;
    }

    const selectedHospitalInfo =
        hospitalInfo[userProfile.hospitalName];

    const facts =
        selectedHospitalInfo &&
        Array.isArray(selectedHospitalInfo.warto_wiedziec)
            ? selectedHospitalInfo.warto_wiedziec
            : [];

    if (facts.length === 0) {
        hospitalFactsCard.hidden = true;
        return;
    }

    facts.forEach(function (fact) {
        const listItem = document.createElement("li");
        listItem.textContent = fact;
        hospitalFactsList.appendChild(listItem);
    });

    if (
        hospitalFactsSource &&
        selectedHospitalInfo &&
        selectedHospitalInfo.warto_wiedziec_zrodlo
    ) {
        hospitalFactsSource.textContent =
            "Źródło: " +
            selectedHospitalInfo.warto_wiedziec_zrodlo;

        hospitalFactsSource.hidden = false;
    }

    hospitalFactsCard.hidden = false;
}

function renderApp() {
    renderCategory(
        "Dokumenty",
        documentsList
    );

    renderCategory(
        "Dla Mamy",
        motherList
    );

    renderCesareanSection();

    renderCategory(
        "Dla Maluszka",
        babyList
    );

    renderCategory(
        "Dla Taty",
        fatherList
    );

   renderHospitalProvidedInfo();
    renderHospitalFacts();
    renderProgress();
}

/* =========================
   PRZYPINANIE WAŻNYCH RZECZY
========================= */

function togglePinned(itemId) {
    items = items.map(
        function (item) {
            if (item.id !== itemId) {
                return item;
            }

            return {
                id: item.id,
                nazwa: item.nazwa,
                kategoria: item.kategoria,
                spakowane: item.spakowane === true,
                wlasny: item.wlasny === true,
                przypiete: item.przypiete !== true
            };
        }
    );

    saveItems(items);
    renderApp();
}


/* =========================
   ODHACZANIE ELEMENTÓW
========================= */

function toggleItem(itemId) {
    items = items.map(
        function (item) {
            if (item.id !== itemId) {
                return item;
            }

            return {
                id: item.id,
                nazwa: item.nazwa,
                kategoria: item.kategoria,
                spakowane: !item.spakowane,
                wlasny: item.wlasny === true,
                przypiete: item.przypiete === true
            };
        }
    );

    saveItems(items);
    renderApp();
}


/* =========================
   USUWANIE ELEMENTÓW
========================= */

function deleteItem(itemId) {
    const selectedItem = items.find(
        function (item) {
            return item.id === itemId;
        }
    );

    if (!selectedItem) {
        return;
    }

    const shouldDelete = window.confirm(
        "Czy na pewno chcesz usunąć „" +
        selectedItem.nazwa +
        "”?"
    );

    if (!shouldDelete) {
        return;
    }

    items = items.filter(
        function (item) {
            return item.id !== itemId;
        }
    );

    saveItems(items);
    renderApp();
}

function setActiveCategory(category) {
    itemCategorySelect.value = category;

    categoryButtons.forEach(function (button) {
        const isSelected =
            button.dataset.category === category;

        button.classList.toggle(
            "active",
            isSelected
        );

        button.setAttribute(
            "aria-pressed",
            String(isSelected)
        );
    });
}


categoryButtons.forEach(function (button) {
    button.addEventListener(
        "click",
        function () {
            setActiveCategory(
                button.dataset.category
            );
        }
    );
});


/* =========================
   DODAWANIE WŁASNYCH RZECZY
========================= */

function createCustomItem(name, category) {
    return {
        id:
            "custom-" +
            Date.now() +
            "-" +
            Math.random().toString(16).slice(2),
        nazwa: name,
        kategoria: category,
        spakowane: false,
        wlasny: true,
        przypiete: false
    };
}


addItemForm.addEventListener(
    "submit",
    function (event) {
        event.preventDefault();

        const name = itemNameInput.value.trim();
        const category = itemCategorySelect.value;

        const allowedCategories = [
            "Dokumenty",
            "Dla Mamy",
            "Cesarskie cięcie",
            "Dla Maluszka",
            "Dla Taty"
        ];

        if (
            name === "" ||
            !allowedCategories.includes(category)
        ) {
            return;
        }

        const newItem = createCustomItem(
            name,
            category
        );

        items.push(newItem);

        saveItems(items);
        renderApp();

        addItemForm.reset();
        setActiveCategory("Dokumenty");
        itemNameInput.focus();
    }
);

/* =========================
   ZAPISYWANIE LISTY DO PDF
========================= */

if (printListButton) {
    printListButton.addEventListener(
        "click",
        function () {
            window.print();
        }
    );
}


/* =========================
   RESETOWANIE LISTY
========================= */

resetListButton.addEventListener(
    "click",
    function () {
        const shouldReset = window.confirm(
            "Czy na pewno chcesz rozpocząć pakowanie od nowa? " +
            "Wszystkie zaznaczenia i własne elementy zostaną usunięte."
        );

        if (!shouldReset) {
            return;
        }

        items = copyInitialItems(
            userProfile.hospitalName
        );

        saveItems(items);
        renderApp();
    }
);

dueDateInput.addEventListener(
    "change",
    function () {
        const previousProfile = userProfile || {};

        userProfile = {
            dueDate: dueDateInput.value,
            pregnancyAdjustmentDays: 0,
            deliveryType:
                previousProfile.deliveryType || "",
            hospitalName:
                previousProfile.hospitalName || ""
        };

        renderPregnancyCalculation();
    }
);

savePregnancyCorrectionButton.addEventListener(
    "click",
    function () {
        if (!dueDateInput.value) {
            alert(
                "Najpierw wybierz planowany termin porodu."
            );
            return;
        }

        const correctedWeek = Number(
            correctedWeekInput.value
        );

        const correctedDay = Number(
            correctedDayInput.value
        );

        if (
            !Number.isInteger(correctedWeek) ||
            correctedWeek < 0 ||
            correctedWeek > 42
        ) {
            alert(
                "Podaj liczbę ukończonych tygodni od 0 do 42."
            );
            return;
        }

        if (
            !Number.isInteger(correctedDay) ||
            correctedDay < 0 ||
            correctedDay > 6
        ) {
            alert(
                "Podaj liczbę dni od 0 do 6."
            );
            return;
        }

        const calculatedPregnancyDay =
            calculatePregnancyDay(
                dueDateInput.value
            );

        const correctedPregnancyDay =
            correctedWeek * 7 +
            correctedDay;

        userProfile.dueDate =
            dueDateInput.value;

        userProfile.pregnancyAdjustmentDays =
            correctedPregnancyDay -
            calculatedPregnancyDay;

        renderPregnancyCalculation();
    }
);

removePregnancyCorrectionButton.addEventListener(
    "click",
    function () {
        if (!userProfile) {
            return;
        }

        userProfile.pregnancyAdjustmentDays = 0;

        correctedWeekInput.value = "";
        correctedDayInput.value = "";

        renderPregnancyCalculation();
    }
);
/* =========================
   PODGLĄD WYBRANEGO SZPITALA
========================= */

if (hospitalNameSelect) {
    hospitalNameSelect.addEventListener("change", function () {
        const selectedHospital = hospitalNameSelect.value;

        if (!heroSubtitle) {
            return;
        }

        if (
            selectedHospital === "" ||
            selectedHospital === "Inny szpital"
        ) {
            heroSubtitle.textContent =
                "Twoja interaktywna lista do pakowania";
        } else {
            heroSubtitle.textContent =
                "Twoja interaktywna lista do pakowania " +
                "opracowana na podstawie zaleceń " +
                getHospitalNameInGenitive(selectedHospital);
        }
    });
}

/* =========================
   OBSŁUGA KREATORA
========================= */

wizardForm.addEventListener(
    "submit",
    function (event) {
        event.preventDefault();

        const dueDate =
            dueDateInput.value;

        const selectedDeliveryType =
            document.querySelector(
                'input[name="delivery-type"]:checked'
            );

        const hospitalName =
            hospitalNameSelect.value;

        if (
            dueDate === "" ||
            !selectedDeliveryType ||
            hospitalName === ""
        ) {
            return;
        }

        const adjustmentDays =
            userProfile &&
            Number.isFinite(
                Number(
                    userProfile.pregnancyAdjustmentDays
                )
            )
                ? Number(
                    userProfile.pregnancyAdjustmentDays
                )
                : 0;

        userProfile = {
            dueDate: dueDate,
            pregnancyAdjustmentDays:
                adjustmentDays,
            deliveryType:
                selectedDeliveryType.value,
            hospitalName: hospitalName
        };

        saveProfile(userProfile);

        items = copyInitialItems(
            userProfile.hospitalName
        );

        saveItems(items);

        showPackingApp();
    }
);

/* OBSŁUGA PRZYCISKU ZMIEŃ USTAWIENIA */

if (editProfileButton) {
    editProfileButton.addEventListener(
        "click",
        function () {
            showWizard();
        }
    );
}

/* =========================x
   START APLIKACJI
========================= */

if (userProfile) {
    showPackingApp();
} else {
    showWizard();
}

/* =========================
   PWA - SERVICE WORKER
========================= */

if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
        navigator.serviceWorker
            .register("/service-worker.js")
            .then(function (registration) {
                console.log(
                    "Service Worker działa:",
                    registration.scope
                );
            })
            .catch(function (error) {
                console.error(
                    "Błąd Service Workera:",
                    error
                );
            });
    });
}

// =========================
// PROŚBA O DODANIE SZPITALA
// =========================

const hospitalRequestToggle = document.getElementById("hospital-request-toggle");
const hospitalRequestForm = document.getElementById("hospital-request-form");
const hospitalRequestSend = document.getElementById("hospital-request-send");
const requestedHospital = document.getElementById("requested-hospital");

if (
    hospitalRequestToggle &&
    hospitalRequestForm &&
    hospitalRequestSend &&
    requestedHospital
) {
    hospitalRequestToggle.addEventListener("click", () => {
        hospitalRequestForm.hidden = !hospitalRequestForm.hidden;

        if (!hospitalRequestForm.hidden) {
            requestedHospital.focus();
        }
    });

    hospitalRequestSend.addEventListener("click", () => {
        const hospitalName = requestedHospital.value.trim();

        if (!hospitalName) {
            alert("Wpisz proszę nazwę szpitala 🤍");
            requestedHospital.focus();
            return;
        }

        const subject = encodeURIComponent(
            "Prośba o dodanie szpitala do Just Pack It"
        );

        const body = encodeURIComponent(
`Cześć!

Chciałabym poprosić o dodanie szpitala do Just Pack It:

🏥 ${hospitalName}

Dziękuję! 🤍`
        );

        window.location.href =
            `mailto:natalia.lukawska91@gmail.com?subject=${subject}&body=${body}`;
    });
}