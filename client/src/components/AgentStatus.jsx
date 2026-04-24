import { motion } from "framer-motion";
import { HiChevronDown } from "react-icons/hi2";
import { useStore } from "../store/useStore";

const options = ["Available", "On Call", "Break"];

export default function AgentStatus() {
  const agentAvailability = useStore((state) => state.agentAvailability);
  const setAgentAvailability = useStore((state) => state.setAgentAvailability);
  const agents = useStore((state) => state.agents);

  return (
    <section className="agent-status-header">
      <div className="status-select-wrapper">
        <label className="status-select">
          <span>Status:</span>
          <div className="select-wrap">
            <select value={agentAvailability} onChange={(event) => setAgentAvailability(event.target.value)}>
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <HiChevronDown size={16} />
          </div>
        </label>
      </div>

      <div className="team-avatars-compact">
        {agents.map((agent) => (
          <motion.div whileHover={{ y: -2 }} key={agent.id} className="agent-chip-compact">
            <span className={`status-dot ${agent.status.toLowerCase().replace(" ", "-")}`} />
            <div>
              <strong>{agent.name}</strong>
              <p>{agent.calls} calls</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
