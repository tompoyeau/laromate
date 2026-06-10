<template>
  <div class="res-panel">

    <!-- ── Header ───────────────────────────────────────────────────────── -->
    <div class="panel-header">
      <h2 class="panel-title">Réservations</h2>
      <div class="header-right">
        <button class="btn btn-primary btn-sm" @click="openCreate">+ Créer</button>
        <div class="view-tabs">
          <button v-for="v in views" :key="v.id"
            :class="['view-tab', { active: view === v.id }]"
            @click="view = v.id">
            {{ v.icon }} {{ v.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── KPI bar ───────────────────────────────────────────────────────── -->
    <div class="kpi-bar">
      <div class="kpi">
        <div class="kpi-val">{{ reservations.todayCovers }}</div>
        <div class="kpi-label">Couverts aujourd'hui</div>
      </div>
      <div class="kpi">
        <div class="kpi-val">{{ reservations.pending.length }}</div>
        <div class="kpi-label">En attente</div>
      </div>
      <div class="kpi">
        <div class="kpi-val">{{ reservations.today.length }}</div>
        <div class="kpi-label">Résa ce jour</div>
      </div>
      <div class="kpi">
        <div class="kpi-val">{{ weekCovers }}</div>
        <div class="kpi-label">Couverts cette semaine</div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- VUE : SERVICE DU JOUR                                             -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <template v-if="view === 'service'">
      <div class="service-toolbar">
        <button class="btn btn-ghost btn-sm" @click="shiftDay(-1)">‹</button>
        <input type="date" v-model="serviceDate" class="form-input date-pick" />
        <button class="btn btn-ghost btn-sm" @click="shiftDay(1)">›</button>
        <button class="btn btn-ghost btn-sm" @click="serviceDate = todayStr">Aujourd'hui</button>
      </div>

      <!-- Résumé du jour -->
      <div class="day-summary">
        <div class="day-stat">
          <span class="ds-icon">🌞</span>
          <span class="ds-val">{{ lunchCovers }} cvt</span>
          <span class="ds-label">Déjeuner</span>
        </div>
        <div class="day-divider"></div>
        <div class="day-stat">
          <span class="ds-icon">🌙</span>
          <span class="ds-val">{{ dinnerCovers }} cvt</span>
          <span class="ds-label">Dîner</span>
        </div>
        <div class="day-divider"></div>
        <div class="day-stat">
          <span class="ds-icon">👥</span>
          <span class="ds-val">{{ lunchCovers + dinnerCovers }} cvt</span>
          <span class="ds-label">Total</span>
        </div>
      </div>

      <!-- Déjeuner -->
      <div v-if="dayLunch.length" class="service-group">
        <div class="service-group-title">🌞 Déjeuner</div>
        <div class="res-cards">
          <div v-for="r in dayLunch" :key="r.id" class="res-card" :class="`card-${r.status}`" @click="openDetail(r)">
            <div class="rc-top">
              <div class="rc-time">{{ r.time }}</div>
              <span :class="['status-badge', `sb-${r.status}`]">{{ STATUS_LABELS[r.status] }}</span>
            </div>
            <div class="rc-name">{{ r.name }}</div>
            <div class="rc-meta">
              <span>👤 {{ r.covers }} couvert{{ r.covers > 1 ? 's' : '' }}</span>
              <span v-if="r.message">💬 {{ r.message }}</span>
            </div>
            <div class="rc-actions" @click.stop>
              <button v-if="r.status === 'pending'" class="rc-btn confirm" @click="quickStatus(r.id, 'confirmed')">✓ Confirmer</button>
              <button v-if="r.status === 'pending' || r.status === 'confirmed'" class="rc-btn cancel" @click="quickStatus(r.id, 'cancelled')">✕ Annuler</button>
              <button v-if="r.status === 'confirmed'" class="rc-btn noshow" @click="quickStatus(r.id, 'noshow')">⊘ No-show</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Dîner -->
      <div v-if="dayDinner.length" class="service-group">
        <div class="service-group-title">🌙 Dîner</div>
        <div class="res-cards">
          <div v-for="r in dayDinner" :key="r.id" class="res-card" :class="`card-${r.status}`" @click="openDetail(r)">
            <div class="rc-top">
              <div class="rc-time">{{ r.time }}</div>
              <span :class="['status-badge', `sb-${r.status}`]">{{ STATUS_LABELS[r.status] }}</span>
            </div>
            <div class="rc-name">{{ r.name }}</div>
            <div class="rc-meta">
              <span>👤 {{ r.covers }} couvert{{ r.covers > 1 ? 's' : '' }}</span>
              <span v-if="r.message">💬 {{ r.message }}</span>
            </div>
            <div class="rc-actions" @click.stop>
              <button v-if="r.status === 'pending'" class="rc-btn confirm" @click="quickStatus(r.id, 'confirmed')">✓ Confirmer</button>
              <button v-if="r.status === 'pending' || r.status === 'confirmed'" class="rc-btn cancel" @click="quickStatus(r.id, 'cancelled')">✕ Annuler</button>
              <button v-if="r.status === 'confirmed'" class="rc-btn noshow" @click="quickStatus(r.id, 'noshow')">⊘ No-show</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!dayLunch.length && !dayDinner.length" class="empty-state card">
        <div class="empty-icon">📅</div>
        <p>Aucune réservation ce jour-là.</p>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- VUE : CALENDRIER                                                   -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <template v-else-if="view === 'calendar'">
      <div class="cal-header">
        <button class="btn btn-ghost btn-sm" @click="shiftMonth(-1)">‹</button>
        <div class="cal-month-title">{{ calMonthLabel }}</div>
        <button class="btn btn-ghost btn-sm" @click="shiftMonth(1)">›</button>
      </div>

      <div class="calendar">
        <div class="cal-dow" v-for="d in DOW" :key="d">{{ d }}</div>
        <div
          v-for="cell in calCells"
          :key="cell.key"
          :class="['cal-cell', {
            'cal-other': !cell.current,
            'cal-today': cell.isToday,
            'cal-selected': calSelected === cell.dateStr,
            'cal-has-res': cell.current && cell.count > 0
          }]"
          @click="cell.current && selectCalDay(cell.dateStr)"
        >
          <span class="cal-day-num">{{ cell.day }}</span>
          <span v-if="cell.current && cell.count > 0" class="cal-chip" :class="chipClass(cell)">
            {{ cell.covers }} cvt
          </span>
        </div>
      </div>

      <!-- Détail du jour sélectionné -->
      <div v-if="calSelected" class="cal-detail">
        <div class="cal-detail-title">
          {{ formatDateFull(calSelected) }}
          <span class="cal-detail-sub">{{ selectedDayRes.length }} réservation(s) · {{ selectedDayCovers }} couverts</span>
        </div>
        <div v-if="selectedDayRes.length" class="res-cards">
          <div v-for="r in selectedDayRes" :key="r.id" class="res-card" :class="`card-${r.status}`" @click="openDetail(r)">
            <div class="rc-top">
              <div class="rc-time">{{ r.time }}</div>
              <span :class="['status-badge', `sb-${r.status}`]">{{ STATUS_LABELS[r.status] }}</span>
            </div>
            <div class="rc-name">{{ r.name }}</div>
            <div class="rc-meta">
              <span>👤 {{ r.covers }} cvt</span>
              <span v-if="r.message">💬 {{ r.message }}</span>
            </div>
            <div class="rc-actions" @click.stop>
              <button v-if="r.status === 'pending'" class="rc-btn confirm" @click="quickStatus(r.id, 'confirmed')">✓</button>
              <button v-if="r.status === 'pending' || r.status === 'confirmed'" class="rc-btn cancel" @click="quickStatus(r.id, 'cancelled')">✕</button>
              <button v-if="r.status === 'confirmed'" class="rc-btn noshow" @click="quickStatus(r.id, 'noshow')">⊘</button>
            </div>
          </div>
        </div>
        <div v-else class="empty-cal-day">Aucune réservation.</div>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- VUE : LISTE COMPLÈTE                                               -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <template v-else-if="view === 'list'">
      <div class="list-toolbar">
        <input v-model="search" class="form-input search-input" placeholder="Nom, email, téléphone…" />
        <input v-model="dateFilter" class="form-input" type="date" style="width:165px" />
        <div class="status-pills">
          <button v-for="f in STATUS_FILTERS" :key="f.value"
            :class="['filter-pill', { active: statusFilter === f.value }]"
            @click="statusFilter = f.value">
            {{ f.label }}
            <span class="pill-count">{{ countByStatus(f.value) }}</span>
          </button>
        </div>
        <button class="btn btn-ghost btn-sm" @click="dateFilter = ''; search = ''; statusFilter = 'all'">Tout réinitialiser</button>
      </div>

      <div v-if="filtered.length" class="res-table">
        <div class="table-head">
          <span>Nom</span>
          <span>Date & Heure</span>
          <span>Cvt</span>
          <span>Contact</span>
          <span>Statut</span>
          <span></span>
        </div>
        <div v-for="r in filtered" :key="r.id" class="table-row" @click="openDetail(r)">
          <div>
            <div class="row-name">{{ r.name }}</div>
            <div class="row-msg" v-if="r.message">💬 {{ r.message }}</div>
            <div class="row-note" v-if="r.note">📝 {{ r.note }}</div>
          </div>
          <div>
            <div class="row-date">{{ formatDate(r.date) }}</div>
            <div class="row-time">{{ r.time }}</div>
          </div>
          <div class="row-covers">{{ r.covers }}</div>
          <div>
            <a :href="`tel:${r.phone}`" class="contact-link" @click.stop>📞 {{ r.phone }}</a>
            <a :href="`mailto:${r.email}`" class="contact-link" @click.stop>✉️ {{ r.email }}</a>
          </div>
          <div @click.stop>
            <span :class="['status-badge', `sb-${r.status}`]">{{ STATUS_LABELS[r.status] }}</span>
          </div>
          <div @click.stop class="row-actions">
            <button class="btn-icon danger" @click="remove(r.id)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state card">
        <div class="empty-icon">🔍</div>
        <p>Aucune réservation ne correspond.</p>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- VUE : PARAMÈTRES HORAIRES & CAPACITÉ                              -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <template v-else-if="view === 'settings'">
      <div class="card settings-card">
        <div class="section-head">⚙️ Capacité & horaires</div>
        <p class="settings-hint">Configurez les services ouverts et la capacité par jour. Un créneau se bloque automatiquement dès que la capacité est atteinte.</p>

        <!-- Intervalle entre les créneaux -->
        <div class="global-slot-row">
          <div class="form-group">
            <label class="form-label">Intervalle entre les créneaux</label>
            <p class="settings-hint" style="margin-bottom:0.65rem">Définit l'écart entre chaque horaire proposé aux clients sur le formulaire de réservation.</p>
            <div class="interval-btns">
              <button
                v-for="n in [15, 30, 45, 60]" :key="n"
                type="button"
                :class="['interval-btn', { active: settingsForm.slotInterval === n }]"
                @click="settingsForm.slotInterval = n">
                {{ n }} min
              </button>
            </div>
            <p class="interval-preview">
              Aperçu déjeuner lundi :
              <span v-for="(t, i) in slotPreview" :key="t">{{ t }}<span v-if="i < slotPreview.length - 1"> · </span></span>
              <span v-if="slotPreviewTruncated"> …</span>
            </p>
          </div>
        </div>

        <!-- Max par créneau -->
        <div class="global-slot-row">
          <div class="form-group" style="flex:0 0 auto">
            <label class="form-label">Max couverts par créneau</label>
            <div class="num-input-wrap">
              <button class="num-btn" @click="settingsForm.maxCoversPerSlot > 1 && settingsForm.maxCoversPerSlot--">−</button>
              <input v-model.number="settingsForm.maxCoversPerSlot" type="number" min="1" max="200" class="form-input num-input" />
              <button class="num-btn" @click="settingsForm.maxCoversPerSlot++">+</button>
            </div>
          </div>
        </div>

        <!-- Grille hebdomadaire -->
        <div class="week-grid">
          <div v-for="day in SCHEDULE_DAYS" :key="day.dow" class="day-row">
            <div class="day-name-col">
              <span class="day-name">{{ day.label }}</span>
            </div>

            <div class="day-controls">
              <!-- Ouvert / Fermé -->
              <label class="toggle-row">
                <input type="checkbox" v-model="settingsForm.schedule[day.dow].open" class="sr-only" />
                <div :class="['toggle-track', { on: settingsForm.schedule[day.dow].open }]">
                  <div class="toggle-thumb"></div>
                </div>
                <span :class="['toggle-lbl', { closed: !settingsForm.schedule[day.dow].open }]">
                  {{ settingsForm.schedule[day.dow].open ? 'Ouvert' : 'Fermé' }}
                </span>
              </label>

              <!-- Services (visible si ouvert) -->
              <template v-if="settingsForm.schedule[day.dow].open">
                <!-- Déjeuner -->
                <div class="service-line">
                  <label class="svc-toggle">
                    <input type="checkbox" v-model="settingsForm.schedule[day.dow].lunch" />
                    <span class="svc-name">🌞 Déjeuner</span>
                  </label>
                  <template v-if="settingsForm.schedule[day.dow].lunch">
                    <div class="svc-timerange">
                      <input type="time" v-model="settingsForm.schedule[day.dow].lunchStart" step="900" class="form-input svc-time-input" title="Premier créneau" />
                      <span class="svc-arr">→</span>
                      <input type="time" v-model="settingsForm.schedule[day.dow].lunchEnd" step="900" class="form-input svc-time-input" title="Dernier créneau" />
                    </div>
                    <div class="num-input-wrap svc-num">
                      <button class="num-btn" @click="settingsForm.schedule[day.dow].maxLunch > 1 && settingsForm.schedule[day.dow].maxLunch--">−</button>
                      <input v-model.number="settingsForm.schedule[day.dow].maxLunch" type="number" min="1" max="500" class="form-input num-input" />
                      <button class="num-btn" @click="settingsForm.schedule[day.dow].maxLunch++">+</button>
                      <span class="svc-unit">cvt max</span>
                    </div>
                  </template>
                </div>

                <!-- Dîner -->
                <div class="service-line">
                  <label class="svc-toggle">
                    <input type="checkbox" v-model="settingsForm.schedule[day.dow].dinner" />
                    <span class="svc-name">🌙 Dîner</span>
                  </label>
                  <template v-if="settingsForm.schedule[day.dow].dinner">
                    <div class="svc-timerange">
                      <input type="time" v-model="settingsForm.schedule[day.dow].dinnerStart" step="900" class="form-input svc-time-input" title="Premier créneau" />
                      <span class="svc-arr">→</span>
                      <input type="time" v-model="settingsForm.schedule[day.dow].dinnerEnd" step="900" class="form-input svc-time-input" title="Dernier créneau" />
                    </div>
                    <div class="num-input-wrap svc-num">
                      <button class="num-btn" @click="settingsForm.schedule[day.dow].maxDinner > 1 && settingsForm.schedule[day.dow].maxDinner--">−</button>
                      <input v-model.number="settingsForm.schedule[day.dow].maxDinner" type="number" min="1" max="500" class="form-input num-input" />
                      <button class="num-btn" @click="settingsForm.schedule[day.dow].maxDinner++">+</button>
                      <span class="svc-unit">cvt max</span>
                    </div>
                  </template>
                </div>
              </template>
            </div>
          </div>
        </div>

        <button class="btn btn-primary" @click="saveSettingsForm" style="margin-top:1.5rem">✓ Enregistrer les horaires</button>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- MODAL : CRÉER UNE RÉSERVATION (ADMIN)                             -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <AppModal v-model="createModal" title="Nouvelle réservation" width="580px">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Nom *</label>
          <input v-model="createForm.name" class="form-input" placeholder="Marie Dupont" required />
        </div>
        <div class="form-group">
          <label class="form-label">Téléphone *</label>
          <input v-model="createForm.phone" class="form-input" type="tel" placeholder="06 12 34 56 78" required />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Email <span class="form-hint-inline">(optionnel)</span></label>
        <input v-model="createForm.email" class="form-input" type="email" placeholder="marie@exemple.fr" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Date *</label>
          <input v-model="createForm.date" class="form-input" type="date" required />
        </div>
        <div class="form-group">
          <label class="form-label">Couverts *</label>
          <select v-model="createForm.covers" class="form-select" required>
            <option v-for="n in 20" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>
      </div>

      <!-- ── Sélection de l'heure par chips ───────────────────────── -->
      <div class="form-group">
        <label class="form-label">Heure *</label>

        <div v-if="!createForm.date" class="slot-placeholder-admin">
          Choisissez une date pour voir les disponibilités.
        </div>

        <template v-else>
          <!-- Slots disponibles (ou tous en mode forcé) -->
          <div v-if="createLunchSlots.length || createDinnerSlots.length" class="admin-time-slots">
            <div v-if="createLunchSlots.length" class="slot-group">
              <p class="slot-label">🌞 Déjeuner</p>
              <div class="slots">
                <button type="button"
                  v-for="s in createLunchSlots" :key="s.time"
                  :class="['slot', { active: createForm.time === s.time, full: !s.available }]"
                  @click="selectCreateSlot(s)">
                  {{ s.time }}
                  <span v-if="!s.available" class="slot-full-tag">Complet</span>
                </button>
              </div>
            </div>
            <div v-if="createDinnerSlots.length" class="slot-group">
              <p class="slot-label">🌙 Dîner</p>
              <div class="slots">
                <button type="button"
                  v-for="s in createDinnerSlots" :key="s.time"
                  :class="['slot', { active: createForm.time === s.time, full: !s.available }]"
                  @click="selectCreateSlot(s)">
                  {{ s.time }}
                  <span v-if="!s.available" class="slot-full-tag">Complet</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Message si aucun créneau dispo (hors mode forcé) -->
          <div v-else-if="!createForm.force" class="slot-placeholder-admin warn">
            Aucun créneau disponible pour {{ createForm.covers }} personne(s) ce jour-là.
          </div>

          <!-- Toggle force -->
          <div class="force-toggle-row">
            <button v-if="!createForm.force" type="button" class="btn-force-toggle" @click="createForm.force = true; createForm.time = ''">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/><path d="M12 8v4M12 16h.01"/></svg>
              Forcer un créneau complet
            </button>
            <div v-else class="force-active-bar">
              <span>⚠️ Mode forcé — tous les créneaux affichés</span>
              <button type="button" class="btn-cancel-force" @click="createForm.force = false; createForm.time = ''">Annuler</button>
            </div>
          </div>

          <!-- Info du créneau sélectionné -->
          <div v-if="createForm.time && createSlotInfo" :class="['capacity-badge', createSlotInfo.ok ? 'cap-ok' : 'cap-force']">
            {{ createSlotInfo.text }}
          </div>
        </template>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Statut</label>
          <select v-model="createForm.status" class="form-select">
            <option value="confirmed">✅ Confirmée</option>
            <option value="pending">🕐 En attente</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Message client <span class="form-hint-inline">(optionnel)</span></label>
        <input v-model="createForm.message" class="form-input" placeholder="Anniversaire, allergie…" />
      </div>
      <div class="form-group">
        <label class="form-label">Note interne <span class="form-hint-inline">(non visible)</span></label>
        <textarea v-model="createForm.note" class="form-textarea" rows="2" placeholder="Table fenêtre, client VIP…"></textarea>
      </div>

      <template #footer>
        <button class="btn btn-ghost" @click="createModal = false">Annuler</button>
        <button class="btn btn-primary" @click="submitCreate" :disabled="!createFormValid">Créer la réservation</button>
      </template>
    </AppModal>

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- MODAL DÉTAIL / FICHE RÉSERVATION                                   -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <AppModal v-model="detailOpen" :title="`Réservation — ${detailRes?.name || ''}`" width="520px">
      <template v-if="detailRes">
        <div class="detail-grid">
          <div class="detail-item">
            <div class="di-label">Date & Heure</div>
            <div class="di-val">{{ formatDateFull(detailRes.date) }} à {{ detailRes.time }}</div>
          </div>
          <div class="detail-item">
            <div class="di-label">Couverts</div>
            <div class="di-val">{{ detailRes.covers }} personne{{ detailRes.covers > 1 ? 's' : '' }}</div>
          </div>
          <div class="detail-item">
            <div class="di-label">Téléphone</div>
            <a :href="`tel:${detailRes.phone}`" class="di-val di-link">{{ detailRes.phone }}</a>
          </div>
          <div class="detail-item">
            <div class="di-label">Email</div>
            <a :href="`mailto:${detailRes.email}`" class="di-val di-link">{{ detailRes.email }}</a>
          </div>
          <div v-if="detailRes.message" class="detail-item full">
            <div class="di-label">Message client</div>
            <div class="di-val di-msg">{{ detailRes.message }}</div>
          </div>
          <div class="detail-item full">
            <div class="di-label">Reçue le</div>
            <div class="di-val">{{ formatCreatedAt(detailRes.createdAt) }}</div>
          </div>
        </div>

        <!-- Statut -->
        <div class="form-group" style="margin-top:1.25rem">
          <label class="form-label">Statut</label>
          <div class="status-btns">
            <button v-for="s in STATUS_OPTIONS" :key="s.value"
              :class="['status-opt', `sopt-${s.value}`, { active: detailRes.status === s.value }]"
              @click="reservations.updateStatus(detailRes.id, s.value)">
              {{ s.icon }} {{ s.label }}
            </button>
          </div>
        </div>

        <!-- Note interne -->
        <div class="form-group" style="margin-top:1rem">
          <label class="form-label">Note interne <span class="form-hint-inline">(non visible par le client)</span></label>
          <textarea
            :value="detailRes.note"
            @input="reservations.updateNote(detailRes.id, $event.target.value)"
            class="form-textarea"
            rows="3"
            placeholder="Table fenêtre, allergie noix, client VIP…"
          ></textarea>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-ghost" style="color:#dc2626" @click="removeFromDetail">🗑 Supprimer</button>
        <button class="btn btn-primary" @click="detailOpen = false">Fermer</button>
      </template>
    </AppModal>

  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { useReservationsStore, toLocalDateStr, DAY_DEFAULT, generateSlots } from '@/stores/reservations.js'
import { useToast } from '@/composables/useToast.js'
import AppModal from '@/components/ui/AppModal.vue'

const reservations = useReservationsStore()
const { success } = useToast()

// ── Views ─────────────────────────────────────────────────────────────────
const view = ref('service')
const views = [
  { id: 'service',  icon: '🍽️', label: 'Service' },
  { id: 'calendar', icon: '📅', label: 'Calendrier' },
  { id: 'list',     icon: '📋', label: 'Liste' },
  { id: 'settings', icon: '⚙️', label: 'Horaires' },
]

const STATUS_LABELS = {
  pending:   'En attente',
  confirmed: 'Confirmée',
  cancelled: 'Annulée',
  noshow:    'No-show',
}

const STATUS_OPTIONS = [
  { value: 'pending',   icon: '🕐', label: 'En attente' },
  { value: 'confirmed', icon: '✅', label: 'Confirmée' },
  { value: 'cancelled', icon: '❌', label: 'Annulée' },
  { value: 'noshow',    icon: '👻', label: 'No-show' },
]

const STATUS_FILTERS = [
  { value: 'all',       label: 'Toutes' },
  { value: 'pending',   label: 'En attente' },
  { value: 'confirmed', label: 'Confirmées' },
  { value: 'cancelled', label: 'Annulées' },
  { value: 'noshow',    label: 'No-show' },
]

const SCHEDULE_DAYS = [
  { dow: 1, label: 'Lundi' },
  { dow: 2, label: 'Mardi' },
  { dow: 3, label: 'Mercredi' },
  { dow: 4, label: 'Jeudi' },
  { dow: 5, label: 'Vendredi' },
  { dow: 6, label: 'Samedi' },
  { dow: 0, label: 'Dimanche' },
]

// ── KPI ───────────────────────────────────────────────────────────────────
const weekCovers = computed(() => reservations.thisWeek.reduce((s, r) => s + r.covers, 0))

// ── Service du jour ────────────────────────────────────────────────────────
// todayStr en heure locale (pas UTC) — évite le bug de date
const todayStr = toLocalDateStr(new Date())
const serviceDate = ref(todayStr)

// Fix bug timezone : on utilise des dates locales, pas toISOString()
function shiftDay(n) {
  const d = new Date(serviceDate.value + 'T12:00:00')
  d.setDate(d.getDate() + n)
  serviceDate.value = toLocalDateStr(d)
}

const LUNCH_END = '15:00'
const dayRes = computed(() =>
  reservations.reservationsOnDay(serviceDate.value).filter(r => r.status !== 'cancelled')
)
const dayLunch  = computed(() => dayRes.value.filter(r => r.time < LUNCH_END))
const dayDinner = computed(() => dayRes.value.filter(r => r.time >= LUNCH_END))
const lunchCovers  = computed(() => dayLunch.value.reduce((s, r) => s + r.covers, 0))
const dinnerCovers = computed(() => dayDinner.value.reduce((s, r) => s + r.covers, 0))

// ── Calendrier ────────────────────────────────────────────────────────────
const DOW = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const calYear  = ref(new Date().getFullYear())
const calMonth = ref(new Date().getMonth())
const calSelected = ref(null)

const calMonthLabel = computed(() =>
  new Date(calYear.value, calMonth.value, 1)
    .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
)

function shiftMonth(n) {
  const d = new Date(calYear.value, calMonth.value + n, 1)
  calYear.value  = d.getFullYear()
  calMonth.value = d.getMonth()
  calSelected.value = null
}

const calCells = computed(() => {
  const firstDay = new Date(calYear.value, calMonth.value, 1)
  const lastDay  = new Date(calYear.value, calMonth.value + 1, 0)
  const todayIso = todayStr
  const cells = []

  // Padding début (lundi = 0)
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(firstDay); d.setDate(d.getDate() - i - 1)
    const ds = toLocalDateStr(d)
    cells.push({ key: 'p'+ds, day: d.getDate(), dateStr: ds, current: false, isToday: false, count: 0, covers: 0 })
  }

  // Jours du mois
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const d = new Date(calYear.value, calMonth.value, day)
    const ds = toLocalDateStr(d)
    const dayItems = reservations.items.filter(r => r.date === ds && ['pending','confirmed'].includes(r.status))
    cells.push({
      key: ds, day, dateStr: ds, current: true,
      isToday: ds === todayIso,
      count:  dayItems.length,
      covers: dayItems.reduce((s, r) => s + r.covers, 0)
    })
  }

  // Padding fin
  const remaining = (7 - (cells.length % 7)) % 7
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(lastDay); d.setDate(d.getDate() + i)
    const ds = toLocalDateStr(d)
    cells.push({ key: 'n'+ds, day: d.getDate(), dateStr: ds, current: false, isToday: false, count: 0, covers: 0 })
  }

  return cells
})

function chipClass(cell) {
  const s = reservations.scheduleForDate(cell.dateStr)
  const maxDay = Math.max(s.lunch ? s.maxLunch : 0, s.dinner ? s.maxDinner : 0)
  const ref = maxDay || 60
  if (cell.covers >= ref) return 'chip-full'
  if (cell.covers >= ref * 0.7) return 'chip-busy'
  return 'chip-ok'
}

function selectCalDay(dateStr) {
  calSelected.value = calSelected.value === dateStr ? null : dateStr
}

const selectedDayRes = computed(() =>
  calSelected.value ? reservations.reservationsOnDay(calSelected.value) : []
)
const selectedDayCovers = computed(() =>
  selectedDayRes.value.filter(r => ['pending','confirmed'].includes(r.status)).reduce((s,r) => s + r.covers, 0)
)

// ── Liste ──────────────────────────────────────────────────────────────────
const search       = ref('')
const dateFilter   = ref('')
const statusFilter = ref('all')

function countByStatus(status) {
  if (status === 'all') return reservations.items.length
  return reservations.items.filter(r => r.status === status).length
}

const filtered = computed(() =>
  reservations.byDate.filter(r => {
    const q = search.value.toLowerCase()
    const matchSearch = !q || r.name.toLowerCase().includes(q) || (r.email||'').toLowerCase().includes(q) || (r.phone||'').includes(search.value)
    const matchDate   = !dateFilter.value || r.date === dateFilter.value
    const matchStatus = statusFilter.value === 'all' || r.status === statusFilter.value
    return matchSearch && matchDate && matchStatus
  })
)

// ── Paramètres (par jour) ─────────────────────────────────────────────────
const settingsForm = reactive({
  slotInterval:     reservations.settings.slotInterval || 15,
  maxCoversPerSlot: reservations.settings.maxCoversPerSlot,
  schedule: Object.fromEntries(
    [0,1,2,3,4,5,6].map(i => [i, { ...DAY_DEFAULT, ...(reservations.settings.schedule?.[i] ?? {}) }])
  )
})

// Sync quand Firestore charge les settings (une seule fois)
let settingsInited = false
watch(() => JSON.stringify(reservations.settings), () => {
  if (settingsInited) return
  settingsInited = true
  const s = reservations.settings
  settingsForm.slotInterval     = s.slotInterval || 15
  settingsForm.maxCoversPerSlot = s.maxCoversPerSlot
  for (let i = 0; i <= 6; i++) {
    Object.assign(settingsForm.schedule[i], { ...DAY_DEFAULT, ...(s.schedule?.[i] ?? {}) })
  }
}, { immediate: false })

// Aperçu des créneaux déjeuner du lundi (max 6 affichés + "…")
const PREVIEW_MAX = 6
const slotPreviewAll  = computed(() => {
  const s = settingsForm.schedule[1] // Lundi comme exemple
  return generateSlots(s?.lunchStart || '12:00', s?.lunchEnd || '14:00', settingsForm.slotInterval || 15)
})
const slotPreview          = computed(() => slotPreviewAll.value.slice(0, PREVIEW_MAX))
const slotPreviewTruncated = computed(() => slotPreviewAll.value.length > PREVIEW_MAX)

function saveSettingsForm() {
  reservations.updateSettings({ ...settingsForm })
  success('Horaires enregistrés')
}

// ── Créer une réservation (admin) ─────────────────────────────────────────
// Créneaux calculés selon le planning du jour sélectionné + l'intervalle
const LUNCH_SLOTS = computed(() => {
  const s = createForm.date
    ? reservations.scheduleForDate(createForm.date)
    : reservations.settings.schedule?.[1] ?? {}
  return generateSlots(s.lunchStart || '12:00', s.lunchEnd || '14:00', reservations.settings.slotInterval || 15)
})
const DINNER_SLOTS = computed(() => {
  const s = createForm.date
    ? reservations.scheduleForDate(createForm.date)
    : reservations.settings.schedule?.[1] ?? {}
  return generateSlots(s.dinnerStart || '19:00', s.dinnerEnd || '21:30', reservations.settings.slotInterval || 15)
})

const createModal = ref(false)
const createForm  = reactive({
  name: '', phone: '', email: '',
  date: todayStr, time: '', covers: 2,
  message: '', note: '', status: 'confirmed', force: false,
})

function openCreate() {
  Object.assign(createForm, {
    name: '', phone: '', email: '',
    date: todayStr, time: '', covers: 2,
    message: '', note: '', status: 'confirmed', force: false,
  })
  createModal.value = true
}

// Slots déjeuner : disponibles (normal) ou tous (force)
const createLunchSlots = computed(() => {
  if (!createForm.date) return []
  const open = reservations.isLunchOpen(createForm.date)
  if (!open && !createForm.force) return []
  return LUNCH_SLOTS.value.map(t => ({
    time: t,
    available: reservations.canBook(createForm.date, t, createForm.covers),
  })).filter(s => createForm.force || s.available)
})

// Slots dîner : disponibles (normal) ou tous (force)
const createDinnerSlots = computed(() => {
  if (!createForm.date) return []
  const open = reservations.isDinnerOpen(createForm.date)
  if (!open && !createForm.force) return []
  return DINNER_SLOTS.value.map(t => ({
    time: t,
    available: reservations.canBook(createForm.date, t, createForm.covers),
  })).filter(s => createForm.force || s.available)
})

// Infos sur le créneau sélectionné (après sélection)
const createSlotInfo = computed(() => {
  if (!createForm.date || !createForm.time) return null
  const ok  = reservations.canBook(createForm.date, createForm.time, createForm.covers)
  const at  = reservations.coversAt(createForm.date, createForm.time)
  const max = reservations.settings.maxCoversPerSlot
  if (ok) return { ok: true,  text: `✓ Créneau disponible — ${at}/${max} cvt sur ce créneau` }
  return   { ok: false, text: `⚠️ Créneau forcé — ${at}/${max} cvt (limite dépassée)` }
})

// Reset heure si la date ou le nombre de couverts change
watch([() => createForm.date, () => createForm.covers], () => {
  createForm.time = ''
})

// Formulaire valide dès qu'un créneau est sélectionné (force intégré à la sélection)
const createFormValid = computed(() =>
  !!(createForm.name.trim() && createForm.phone.trim() && createForm.date && createForm.time)
)

// Sélectionner un créneau : si complet → active implicitement le mode forcé
function selectCreateSlot(s) {
  createForm.time = s.time
  if (!s.available) createForm.force = true
}

async function submitCreate() {
  if (!createFormValid.value) return
  await reservations.adminAdd({
    name:    createForm.name.trim(),
    phone:   createForm.phone.trim(),
    email:   createForm.email.trim(),
    date:    createForm.date,
    time:    createForm.time,
    covers:  createForm.covers,
    message: createForm.message.trim(),
    note:    createForm.note.trim(),
    status:  createForm.status,
  })
  createModal.value = false
  success(`Réservation créée pour ${createForm.name} ✓`)
}

// ── Modal détail ──────────────────────────────────────────────────────────
const detailOpen = ref(false)
const detailRes  = ref(null)

function openDetail(r) {
  detailRes.value = r
  detailOpen.value = true
}

function quickStatus(id, status) {
  reservations.updateStatus(id, status)
  success(status === 'confirmed' ? 'Réservation confirmée ✓' : status === 'cancelled' ? 'Réservation annulée' : 'No-show enregistré')
}

function remove(id) {
  if (!confirm('Supprimer cette réservation ?')) return
  reservations.remove(id)
  success('Supprimée')
}

function removeFromDetail() {
  if (!confirm('Supprimer cette réservation ?')) return
  reservations.remove(detailRes.value.id)
  detailOpen.value = false
  success('Supprimée')
}

// ── Formatters ────────────────────────────────────────────────────────────
function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatDateFull(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatCreatedAt(ts) {
  return new Date(ts).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.res-panel { display: flex; flex-direction: column; gap: 1.25rem; }

/* ── Header ──────────────────────────────────────────────────────────── */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}
.panel-title { font-family: var(--font-heading); font-size: 1.6rem; }

.header-right { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }

.view-tabs { display: flex; gap: 0.35rem; background: var(--bg); border-radius: var(--radius); padding: 0.25rem; }
.view-tab {
  padding: 0.45rem 1rem;
  border-radius: calc(var(--radius) - 2px);
  font-size: 0.82rem; font-weight: 500;
  color: var(--text-light);
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.2s;
}
.view-tab.active { background: var(--bg-card); color: var(--primary); box-shadow: var(--shadow-sm); }
.view-tab:hover:not(.active) { color: var(--text); }

/* ── KPI bar ─────────────────────────────────────────────────────────── */
.kpi-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.kpi {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem 1.25rem;
  text-align: center;
}
.kpi-val { font-family: var(--font-heading); font-size: 2rem; color: var(--primary); line-height: 1; }
.kpi-label { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.35rem; }

/* ── Service du jour ─────────────────────────────────────────────────── */
.service-toolbar {
  display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;
}
.date-pick { width: 160px; }

.day-summary {
  display: flex;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem 1.5rem;
  gap: 1.5rem;
}
.day-stat { display: flex; align-items: center; gap: 0.6rem; }
.ds-icon { font-size: 1.2rem; }
.ds-val { font-family: var(--font-heading); font-size: 1.4rem; color: var(--text); }
.ds-label { font-size: 0.78rem; color: var(--text-muted); }
.day-divider { width: 1px; height: 32px; background: var(--border); flex-shrink: 0; }

.service-group {}
.service-group-title {
  font-weight: 700; font-size: 0.85rem;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
}

.res-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0.75rem; }

.res-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid var(--border);
}
.res-card:hover { box-shadow: var(--shadow); transform: translateY(-1px); }

.card-pending   { border-left-color: #f59e0b; }
.card-confirmed { border-left-color: #10b981; }
.card-cancelled { border-left-color: #ef4444; opacity: 0.6; }
.card-noshow    { border-left-color: #6b7280; opacity: 0.7; }

.rc-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.rc-time { font-size: 1.1rem; font-weight: 700; font-family: var(--font-heading); color: var(--text); }
.rc-name { font-weight: 600; font-size: 0.95rem; margin-bottom: 0.4rem; }
.rc-meta { display: flex; flex-direction: column; gap: 0.15rem; font-size: 0.8rem; color: var(--text-light); margin-bottom: 0.75rem; }

.rc-actions { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.rc-btn {
  padding: 0.3rem 0.65rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.15s;
  border: none;
}
.rc-btn.confirm { background: #d1fae5; color: #065f46; }
.rc-btn.confirm:hover { background: #10b981; color: #fff; }
.rc-btn.cancel  { background: #fee2e2; color: #991b1b; }
.rc-btn.cancel:hover  { background: #ef4444; color: #fff; }
.rc-btn.noshow  { background: #f3f4f6; color: #374151; }
.rc-btn.noshow:hover  { background: #6b7280; color: #fff; }

/* ── Status badge ────────────────────────────────────────────────────── */
.status-badge {
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border-radius: 99px;
  font-size: 0.72rem;
  font-weight: 600;
}
.sb-pending   { background: #fff3cd; color: #856404; }
.sb-confirmed { background: #d1e7dd; color: #0f5132; }
.sb-cancelled { background: #f8d7da; color: #842029; }
.sb-noshow    { background: #e5e7eb; color: #374151; }

/* ── Calendrier ──────────────────────────────────────────────────────── */
.cal-header { display: flex; align-items: center; gap: 1rem; }
.cal-month-title { font-family: var(--font-heading); font-size: 1.2rem; flex: 1; text-align: center; text-transform: capitalize; }

.calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.75rem;
}

.cal-dow {
  text-align: center;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  padding: 0.4rem 0;
}

.cal-cell {
  min-height: 64px;
  border-radius: var(--radius-sm);
  padding: 0.35rem 0.4rem;
  cursor: pointer;
  transition: background 0.15s;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.cal-cell:hover:not(.cal-other) { background: var(--bg); }
.cal-other { opacity: 0.25; cursor: default; }

.cal-today .cal-day-num {
  background: var(--primary);
  color: #fff;
  border-radius: 50%;
  width: 22px; height: 22px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700;
}

.cal-selected { background: color-mix(in srgb, var(--primary) 8%, var(--bg-card)); outline: 2px solid var(--primary); }

.cal-day-num { font-size: 0.82rem; font-weight: 500; }

.cal-chip {
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  white-space: nowrap;
}
.chip-ok   { background: #d1fae5; color: #065f46; }
.chip-busy { background: #fef3c7; color: #92400e; }
.chip-full { background: #fee2e2; color: #991b1b; }

.cal-detail { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.25rem; }
.cal-detail-title { font-family: var(--font-heading); font-size: 1.05rem; margin-bottom: 1rem; display: flex; align-items: baseline; gap: 0.75rem; text-transform: capitalize; }
.cal-detail-sub { font-size: 0.82rem; color: var(--text-muted); font-family: var(--font-body); }
.empty-cal-day { color: var(--text-muted); font-style: italic; font-size: 0.88rem; }

/* ── Liste ───────────────────────────────────────────────────────────── */
.list-toolbar { display: flex; gap: 0.65rem; flex-wrap: wrap; align-items: center; }
.search-input { flex: 1; min-width: 180px; }
.status-pills { display: flex; gap: 0.35rem; flex-wrap: wrap; }

.filter-pill {
  display: flex; align-items: center; gap: 0.35rem;
  padding: 0.3rem 0.75rem;
  border-radius: 99px;
  border: 1.5px solid var(--border);
  font-size: 0.78rem; cursor: pointer;
  background: var(--bg-card); color: var(--text-light);
  font-family: var(--font-body);
  transition: all 0.2s;
}
.filter-pill.active { background: var(--primary); color: #fff; border-color: var(--primary); }
.pill-count { font-size: 0.68rem; background: rgba(255,255,255,0.25); padding: 0.1rem 0.35rem; border-radius: 99px; }
.filter-pill:not(.active) .pill-count { background: var(--border); color: var(--text-muted); }

.res-table { background: var(--bg-card); border-radius: var(--radius); border: 1px solid var(--border); overflow: hidden; }

.table-head {
  display: grid;
  grid-template-columns: 1.5fr 1.2fr 0.4fr 1.5fr 0.9fr 0.3fr;
  gap: 0.75rem;
  padding: 0.65rem 1rem;
  background: var(--bg);
  font-size: 0.72rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.05em;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
}

.table-row {
  display: grid;
  grid-template-columns: 1.5fr 1.2fr 0.4fr 1.5fr 0.9fr 0.3fr;
  gap: 0.75rem;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--border);
  align-items: center;
  font-size: 0.85rem;
  transition: background 0.15s;
  cursor: pointer;
}
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: var(--bg); }

.row-name { font-weight: 600; }
.row-msg, .row-note { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem; }
.row-date { font-weight: 500; }
.row-time { font-size: 0.78rem; color: var(--text-light); }
.row-covers { font-weight: 700; color: var(--primary); text-align: center; }

.contact-link { display: block; font-size: 0.78rem; color: var(--text-light); text-decoration: none; }
.contact-link:hover { color: var(--primary); }

.row-actions { display: flex; justify-content: center; }
.danger:hover { background: #fee2e2; color: #dc2626; }

/* ── Paramètres horaires ─────────────────────────────────────────────── */
.settings-card { padding: 1.5rem; }
.section-head { font-weight: 600; font-size: 0.95rem; margin-bottom: 0.5rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border); }
.settings-hint { font-size: 0.82rem; color: var(--text-muted); margin-bottom: 1.5rem; line-height: 1.6; }

.global-slot-row {
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
  margin-bottom: 1.75rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border);
}

.interval-btns {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.65rem;
}

.interval-btn {
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-sm);
  border: 2px solid var(--border);
  background: var(--bg);
  color: var(--text-light);
  font-size: 0.88rem;
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.15s;
}
.interval-btn:hover:not(.active) { border-color: var(--primary); color: var(--primary); }
.interval-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.interval-preview {
  font-size: 0.78rem;
  color: var(--text-muted);
  font-style: italic;
  line-height: 1.6;
}



.week-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.day-row {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 0.9rem 0;
  border-bottom: 1px solid var(--border);
}
.day-row:last-child { border-bottom: none; }

.day-name-col {
  flex: 0 0 90px;
  padding-top: 0.35rem;
}
.day-name {
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--text);
}

.day-controls {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

/* Toggle ouvert/fermé */
.toggle-row {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  user-select: none;
}
.sr-only { position: absolute; width: 1px; height: 1px; clip: rect(0,0,0,0); overflow: hidden; }

.toggle-track {
  width: 36px; height: 20px;
  border-radius: 10px;
  background: var(--border);
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
}
.toggle-track.on { background: var(--primary); }

.toggle-thumb {
  position: absolute;
  top: 3px; left: 3px;
  width: 14px; height: 14px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  transition: left 0.2s;
}
.toggle-track.on .toggle-thumb { left: 19px; }

.toggle-lbl { font-size: 0.85rem; font-weight: 600; color: var(--primary); }
.toggle-lbl.closed { color: var(--text-muted); }

/* Service line */
.service-line {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-left: 0.25rem;
}

.svc-toggle {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  user-select: none;
  flex: 0 0 130px;
}
.svc-toggle input[type=checkbox] { accent-color: var(--primary); width: 14px; height: 14px; }
.svc-name { font-size: 0.85rem; color: var(--text); }

.svc-timerange {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
.svc-time-input { width: 92px; text-align: center; font-size: 0.82rem; padding: 0.3rem 0.4rem; }
.svc-arr { font-size: 0.8rem; color: var(--text-muted); flex-shrink: 0; }

.svc-num { display: flex; align-items: center; }
.svc-unit { font-size: 0.78rem; color: var(--text-muted); margin-left: 0.5rem; white-space: nowrap; }

/* ── Modal créer réservation ─────────────────────────────────────────── */
.admin-time-slots { display: flex; flex-direction: column; gap: 0.85rem; margin-bottom: 0.6rem; }

/* Chips créneaux dans la modal admin */
.slot-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 0.4rem;
}
.slots { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.slot {
  padding: 0.35rem 0.7rem;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border);
  background: var(--bg);
  color: var(--text);
  font-size: 0.82rem;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.15s;
}
.slot.active { background: var(--primary); border-color: var(--primary); color: #fff; }
.slot:hover:not(.active):not(.full) { border-color: var(--primary); color: var(--primary); }
.slot.full {
  border-style: dashed;
  color: var(--text-muted);
  opacity: 0.75;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.05rem;
  padding-top: 0.2rem;
  padding-bottom: 0.2rem;
}
.slot.full.active { background: #f59e0b; border-color: #f59e0b; color: #fff; opacity: 1; border-style: solid; }
.slot-full-tag {
  font-size: 0.58rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  color: #ef4444;
  line-height: 1;
}
.slot.full.active .slot-full-tag { color: rgba(255,255,255,0.85); }

.slot-placeholder-admin {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-style: italic;
  padding: 0.4rem 0 0.6rem;
}
.slot-placeholder-admin.warn {
  font-style: normal;
  color: #856404;
  background: #fff3cd;
  padding: 0.55rem 0.85rem;
  border-radius: var(--radius-sm);
  margin-bottom: 0.5rem;
}

.force-toggle-row { margin-top: 0.25rem; }

.btn-force-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: var(--text-muted);
  border: 1.5px dashed var(--border);
  border-radius: var(--radius-sm);
  padding: 0.35rem 0.75rem;
  background: transparent;
  cursor: pointer;
  font-family: var(--font-body);
  transition: all 0.15s;
}
.btn-force-toggle:hover { border-color: #f59e0b; color: #856404; background: #fffbeb; }

.force-active-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #fff3cd;
  border: 1px solid #f59e0b;
  border-radius: var(--radius-sm);
  padding: 0.45rem 0.85rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: #856404;
}

.btn-cancel-force {
  margin-left: auto;
  font-size: 0.78rem;
  color: #856404;
  font-family: var(--font-body);
  background: rgba(245,158,11,0.15);
  border: none;
  border-radius: var(--radius-sm);
  padding: 0.2rem 0.6rem;
  cursor: pointer;
}
.btn-cancel-force:hover { background: rgba(245,158,11,0.3); }

.capacity-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.85rem;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  font-weight: 500;
  margin-top: 0.5rem;
}
.cap-ok    { background: #d1fae5; color: #065f46; }
.cap-force { background: #fff3cd; color: #856404; }

/* ── Paramètres ──────────────────────────────────────────────────────── */
.num-input-wrap { display: flex; align-items: center; gap: 0; }
.num-btn {
  width: 36px; height: 38px;
  background: var(--bg);
  border: 1.5px solid var(--border);
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.15s;
  flex-shrink: 0;
}
.num-btn:first-child { border-radius: var(--radius-sm) 0 0 var(--radius-sm); border-right: none; }
.num-btn:last-child  { border-radius: 0 var(--radius-sm) var(--radius-sm) 0; border-left: none; }
.num-btn:hover { background: var(--border); }
.num-input { border-radius: 0; text-align: center; width: 70px; flex-shrink: 0; }

/* ── Modal détail ────────────────────────────────────────────────────── */
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.detail-item.full { grid-column: 1/-1; }
.di-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); margin-bottom: 0.25rem; }
.di-val { font-size: 0.92rem; color: var(--text); }
.di-link { color: var(--primary); text-decoration: none; }
.di-link:hover { text-decoration: underline; }
.di-msg { background: var(--bg); padding: 0.6rem 0.75rem; border-radius: var(--radius-sm); font-style: italic; color: var(--text-light); }

.status-btns { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.status-opt {
  padding: 0.45rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.82rem; font-weight: 500;
  cursor: pointer;
  border: 2px solid var(--border);
  background: var(--bg);
  font-family: var(--font-body);
  transition: all 0.15s;
}
.status-opt.active.sopt-pending   { border-color: #f59e0b; background: #fff3cd; color: #856404; }
.status-opt.active.sopt-confirmed { border-color: #10b981; background: #d1fae5; color: #065f46; }
.status-opt.active.sopt-cancelled { border-color: #ef4444; background: #fee2e2; color: #991b1b; }
.status-opt.active.sopt-noshow    { border-color: #6b7280; background: #f3f4f6; color: #374151; }
.status-opt:hover:not(.active) { border-color: var(--primary); }

.form-hint-inline { font-size: 0.75rem; color: var(--text-muted); font-weight: 400; }

/* ── Empty ───────────────────────────────────────────────────────────── */
.empty-state { padding: 3rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.empty-icon { font-size: 2.5rem; }
.empty-state p { color: var(--text-muted); font-style: italic; }

/* ── Responsive ──────────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .kpi-bar { grid-template-columns: repeat(2, 1fr); }
  .table-head, .table-row { grid-template-columns: 1.2fr 1fr 0.4fr 1fr; }
  .table-head span:nth-child(4), .table-row > div:nth-child(4) { display: none; }
  .table-head span:last-child, .table-row > div:last-child { display: none; }
  .day-row { flex-direction: column; gap: 0.5rem; }
  .day-name-col { flex: none; }
}
@media (max-width: 600px) {
  .kpi-bar { grid-template-columns: repeat(2, 1fr); }
  .view-tab { padding: 0.4rem 0.6rem; font-size: 0.75rem; }
  .res-cards { grid-template-columns: 1fr; }
  .day-summary { flex-wrap: wrap; gap: 1rem; }
  .header-right { flex-direction: column; align-items: flex-end; }
  .service-line { flex-wrap: wrap; }
}
</style>
