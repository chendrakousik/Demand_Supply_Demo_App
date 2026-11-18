import { CardIcon } from './figma-card-icons.js'
import { PrototypeAction, PrototypeText } from '../prototype-action.js'

export default function SiliconFlowV2SelectRole() {
  return (
    <div className="layer-44" data-node-id="13:2" data-name="SiliconFlow V2 / Select Role">
      <p className="layer-435" data-node-id="13:3">
        SILICONFLOW
      </p>
      <PrototypeText value="current-role" className="layer-436" data-node-id="13:4">
        Current role: Planner
      </PrototypeText>
      <p className="layer-437" data-node-id="13:5">
        Select an assigned role below to change the permissions for this session.
      </p>
      <PrototypeAction action="Role / Admin" className="layer-438" data-node-id="13:6" data-name="Role / Admin">
        <p className="layer-439" data-node-id="13:7">
          Admin
        </p>
        <p className="layer-440" data-node-id="13:8">
          All modules + administration
        </p>
        <CardIcon name={"SelectRole / Admin"} attached />
        <div className="layer-446" data-node-id="4014:7" data-name="Premium / role accent" />
        <div className="layer-447" data-node-id="4014:8" data-name="Premium / role CTA tile" />
        <p className="layer-448" data-node-id="4014:9">
          →
        </p>
      </PrototypeAction>
      <PrototypeAction action="Role / Data" className="layer-449" data-node-id="13:10" data-name="Role / Data">
        <p className="layer-439" data-node-id="13:11">
          Data
        </p>
        <p className="layer-440" data-node-id="13:12">
          Master data and transaction uploads
        </p>
        <CardIcon name={"SelectRole / Data"} attached />
        <div className="layer-446" data-node-id="4014:14" data-name="Premium / role accent" />
        <div className="layer-447" data-node-id="4014:15" data-name="Premium / role CTA tile" />
        <p className="layer-448" data-node-id="4014:16">
          →
        </p>
      </PrototypeAction>
      <PrototypeAction action="Role / Planner" className="layer-453" data-node-id="13:14" data-name="Role / Planner">
        <p className="layer-454" data-node-id="13:15">
          Planner
        </p>
        <p className="layer-455" data-node-id="13:16">
          Supply operations and allocation tools
        </p>
        <CardIcon name={"SelectRole / Planner"} attached />
        <div className="layer-460" data-node-id="4014:21" data-name="Premium / role accent" />
        <div className="layer-461" data-node-id="4014:22" data-name="Premium / role CTA tile" />
        <p className="layer-462" data-node-id="4014:23">
          →
        </p>
      </PrototypeAction>
      <PrototypeAction action="Role / Business Analyst" className="layer-463" data-node-id="13:18" data-name="Role / Business Analyst">
        <p className="layer-439" data-node-id="13:19">
          Business Analyst
        </p>
        <p className="layer-440" data-node-id="13:20">
          Allocation results and reporting
        </p>
        <CardIcon name={"SelectRole / Business Analyst"} attached />
        <div className="layer-446" data-node-id="4014:28" data-name="Premium / role accent" />
        <div className="layer-447" data-node-id="4014:29" data-name="Premium / role CTA tile" />
        <p className="layer-448" data-node-id="4014:30">
          →
        </p>
      </PrototypeAction>
      <PrototypeAction action="Back Home" className="layer-467" data-node-id="13:22" data-name="Back Home">
        <p className="layer-468" data-node-id="13:23">{`←  Home`}</p>
      </PrototypeAction>
      <div className="layer-469" data-node-id="2010:40" data-name="Premium / role eyebrow" />
    </div>
  );
}
