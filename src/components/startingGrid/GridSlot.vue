<template>
  <div class="grid-slot">
    <div
      class="grid-pos-badge"
      :id="`badge-p${position}`"
      :style="{ background: color }"
    >
      P{{ position }}
    </div>
    <div
      class="grid-card-f1"
      :id="`card-f1-p${position}`"
      :style="{ borderLeft: color ? `5px solid ${color}` : '' }"
    >
      <img
        :id="`car-grid-p${position}`"
        class="car-bg-image"
        :src="carImg"
        style="
          position: absolute;
          right: 0;
          bottom: -10px;
          height: 120%;
          max-width: 60%;
          opacity: 0.35;
          object-fit: contain;
          pointer-events: none;
          z-index: 1;
        "
      />
      <div
        style="
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0;
          position: relative;
          z-index: 2;
        "
      >
        <div
          style="
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 2px;
          "
        >
          <span
            :id="`num-f1-p${position}`"
            class="driver-num-text"
            :style="{
              color: color,
            }"
            >{{ number }}</span
          >
          <img
            v-if="country"
            :id="`flag-f1-p${position}`"
            :src="country ? `https://flagcdn.com/w20/${country}.png` : ''"
            style="width: 18px; border-radius: 2px"
          />
        </div>
        <select
          :id="`select-grid-p${position}`"
          class="grid-select-paddock"
          :data-position="`${position}`"
          style="
            width: 100%;
            background: transparent;
            border: none;
            color: #fff;
            font-size: 15px;
            font-weight: bold;
            cursor: pointer;
            padding: 2px 0;
            outline: none;
            text-overflow: ellipsis;
          "
          v-html="optionsHtml"
          @change="handleDriverSelect"
        ></select>
        <div
          :id="`team-grid-p${position}`"
          class="driver-team-text"
          :style="{ color: team ? '#ff8000' : '#616e88' }"
        >
          {{ team ? team : "⚡ PLACE À PRENDRE" }}
        </div>
      </div>
      <div
        class="driver-portrait-container"
        style="
          position: relative;
          width: 65px;
          height: 65px;
          display: flex;
          justify-content: center;
          overflow: hidden;
          margin-left: 10px;
          border-radius: 4px;
          z-index: 2;
          flex-shrink: 0;
        "
      >
        <img
          v-if="driverImg"
          :id="`img-grid-p${position}`"
          :src="driverImg"
          style="
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: top;
          "
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { computed, ref } from "vue";
import { drivers } from "../../utils";

defineProps(["position"]);

const number = ref("--");
const color = ref("");
const country = ref("");
const driverImg = ref("");
const carImg = ref("");
const team = ref("");

const options = computed(() =>
  drivers.map((driver) => ({
    value: driver.name,
    label: driver.name,
  })),
);
const optionsWithDefault = computed(() =>
  [{ value: "", label: "👉 CHOISIS TON PILOTE" }].concat(options.value),
);
const optionsHtml = computed(() =>
  optionsWithDefault.value.map(
    (option) => `<option value="${option.value}">${option.label}</option>`,
  ),
);

function handleDriverSelect(event) {
  const driverName = event.target.value;
  if (!driverName) {
    number.value = "--";
    color.value = "";
    country.value = "";
    driverImg.value = "";
    carImg.value = "";
    team.value = "";
    return;
  }

  const driver = drivers.find((driver) => driver.name === driverName);
  if (!driver) {
    return;
  }
  number.value = driver.number;
  color.value = driver.color;
  country.value = driver.country;
  driverImg.value = driver.driverImg;
  carImg.value = driver.carImg;
  team.value = driver.team;
}
</script>

<style scoped lang="css">
.grid-slot {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 8px !important;
  width: 100% !important;
  margin-bottom: 12px !important;
}

.grid-pos-badge {
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border-radius: 6px;
  background: #232e44;
  color: #fff;
  flex-shrink: 0;
  transition: background 0.3s ease;
}

.grid-card-f1 {
  position: relative;
  background: #1f293d;
  display: flex;
  align-items: center;
  flex-grow: 1;
  min-width: 0;
  border-radius: 8px;
  border: 1px solid #2f3e56;
  padding: 6px 12px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.driver-team-text {
  color: #616e88;
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.driver-num-text {
  font-size: 20px;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.15);
  font-style: italic;
}

@media (max-width: 576px) {
  .grid-slot {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 0px !important;
    margin-bottom: 18px !important;
    background: transparent !important;
    padding: 0 !important;
    border: none !important;
    box-shadow: none !important;
  }
  .grid-pos-badge {
    width: 100% !important;
    max-width: 100% !important;
    height: 28px !important;
    font-size: 13px !important;
    border-radius: 8px 8px 0 0 !important;
    justify-content: center !important;
    padding: 0 !important;
    text-align: center !important;
  }
  .grid-card-f1 {
    width: 100% !important;
    border-radius: 0 0 8px 8px !important;
    padding: 8px 12px !important;
    box-sizing: border-box !important;
  }
  .grid-select-paddock {
    font-size: 14px !important;
  }
  .driver-team-text {
    font-size: 10px !important;
  }
  .driver-num-text {
    font-size: 18px !important;
  }
  .driver-portrait-container {
    width: 60px !important;
    height: 60px !important;
  }
  .car-bg-image {
    max-width: 65% !important;
    height: 120% !important;
  }
}
</style>
