import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useStore } from "../store/useStore";

const options = ["Available", "On Call", "Break"];

export default function AgentStatus() {
  const agentAvailability = useStore((state) => state.agentAvailability);
  const setAgentAvailability = useStore((state) => state.setAgentAvailability);
  const agents = useStore((state) => state.agents);

  return (
    <section className="panel status-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Agent Desk</p>
          <h2>Status and team pulse</h2>
        </div>
      </div>

      <div className="status-toolbar">
        <label className="status-select">
          <span>Your status</span>
          <div className="select-wrap">
            <select value={agentAvailability} onChange={(event) => setAgentAvailability(event.target.value)}>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown size={16} />
          </div>
        </label>

        <div className="team-avatars">
          {agents.map((agent) => (
            <motion.div whileHover={{ y: -2 }} key={agent.id} className="agent-chip">
              <span className={`status-indicator ${agent.status.toLowerCase().replace(" ", "-")}`} />
              <div>
                <strong>{agent.name}</strong>
                <p>
                  {agent.status} • {agent.calls} calls
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
