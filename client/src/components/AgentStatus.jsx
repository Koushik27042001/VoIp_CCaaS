import { ChevronDown } from "lucide-react";
import { useStore } from "../store/useStore";

const options = ["Available", "On Call", "Break"];

const statusClass = (status = "") => status.toLowerCase().replace(/\s+/g, "-");

function initials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

export default function AgentStatus() {
  const agentAvailability = useStore((state) => state.agentAvailability);
  const setAgentAvailability = useStore((state) => state.setAgentAvailability);
  const agents = useStore((state) => state.agents);

  return (
    <section className="agent-strip">
      <div className="status-select-group">
        <span className={`pulse-dot ${statusClass(agentAvailability)}`} />
        <label className="select-shell">
          <select value={agentAvailability} onChange={(event) => setAgentAvailability(event.target.value)}>
            {options.map((option) => (
              <option value={option} key={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown size={14} />
        </label>
        <span className="status-caption">Your status</span>
      </div>

      <div className="agent-divider" />

      <div className="agent-row">
        {agents.map((agent) => (
          <div className="agent-chip" key={agent.id}>
            <div className="avatar sm">
              {initials(agent.name)}
              <span className={`presence ${statusClass(agent.status)}`} />
            </div>
            <div>
              <strong>{agent.name}</strong>
              <p>{agent.calls} calls</p>
            </div>
          </div>
        ))}
      </div>

      <div className="system-live">
        <span className="pulse-dot available" />
        <span>System live</span>
      </div>
    </section>
  );
}
