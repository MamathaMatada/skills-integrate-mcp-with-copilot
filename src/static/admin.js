document.addEventListener("DOMContentLoaded", async () => {
  const totalActivitiesEl = document.getElementById("total-activities");
  const totalParticipantsEl = document.getElementById("total-participants");
  const openSpotsEl = document.getElementById("open-spots");
  const popularActivityEl = document.getElementById("popular-activity");
  const activityTableBody = document.getElementById("activity-table-body");
  const memberList = document.getElementById("member-list");
  const refreshButton = document.getElementById("refresh-data");

  async function loadSummary() {
    try {
      const response = await fetch("/api/admin/summary");
      if (!response.ok) {
        throw new Error("Unable to load dashboard summary");
      }

      const summary = await response.json();

      totalActivitiesEl.textContent = summary.total_activities;
      totalParticipantsEl.textContent = summary.total_participants;
      openSpotsEl.textContent = summary.open_spots;
      popularActivityEl.textContent = summary.most_popular_activity || "—";

      activityTableBody.innerHTML = "";
      summary.activities.forEach((activity) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${activity.name}</td>
          <td>${activity.schedule}</td>
          <td>${activity.participants}</td>
          <td>${activity.capacity}</td>
          <td><span class="status-tag ${activity.status === "Full" ? "status-full" : "status-open"}">${activity.status}</span></td>
        `;
        activityTableBody.appendChild(row);
      });

      memberList.innerHTML = "";
      const studentEmails = [];
      summary.activities.forEach((activity) => {
        activity.participantsList = [];
      });

      const activitiesResponse = await fetch("/activities");
      const activities = await activitiesResponse.json();

      Object.entries(activities).forEach(([name, details]) => {
        details.participants.forEach((email) => {
          studentEmails.push({ name: email.split("@")[0], email, activity: name });
        });
      });

      const uniqueMembers = [...new Map(studentEmails.map((member) => [member.email, member])).values()];
      uniqueMembers.slice(0, 8).forEach((member) => {
        const item = document.createElement("li");
        item.innerHTML = `
          <strong>${member.name}</strong>
          <span>${member.email}</span>
        `;
        memberList.appendChild(item);
      });

      if (uniqueMembers.length === 0) {
        memberList.innerHTML = "<li><strong>No members yet</strong><span>Student signups will appear here.</span></li>";
      }
    } catch (error) {
      console.error(error);
      activityTableBody.innerHTML = '<tr><td colspan="5">Unable to load dashboard data.</td></tr>';
      memberList.innerHTML = '<li><strong>Data unavailable</strong><span>Please refresh the page.</span></li>';
    }
  }

  refreshButton.addEventListener("click", loadSummary);

  await loadSummary();
});
