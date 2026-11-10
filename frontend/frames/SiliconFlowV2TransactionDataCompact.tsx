import { PrototypeAction, PrototypeUpload, PrototypeText } from '../prototype-action.js'

export default function SiliconFlowV2TransactionDataCompact() {
  return (
    <div className="layer-44" data-node-id="13:150" data-name="SiliconFlow V2 / Transaction Data / Compact">
      <PrototypeAction action="Nav / Home" className="layer-470" data-node-id="13:160" data-name="Nav / Home">
        <p className="layer-471" data-node-id="13:161">
          ⌂
        </p>
      </PrototypeAction>
      <PrototypeAction action="Nav / Data Management" className="layer-493" data-node-id="13:162" data-name="Nav / Data Management">
        <p className="layer-471" data-node-id="13:163">
          DM
        </p>
      </PrototypeAction>
      <PrototypeAction action="Nav / Master Data" className="layer-474" data-node-id="13:164" data-name="Nav / Master Data">
        <p className="layer-471" data-node-id="13:165">
          MD
        </p>
      </PrototypeAction>
      <div className="layer-570" data-node-id="13:166" data-name="Nav / Transaction Data">
        <p className="layer-473" data-node-id="13:167">
          TD
        </p>
      </div>
      <p className="layer-476" data-node-id="13:168">
        TRANSACTION DATA
      </p>
      <p className="layer-477" data-node-id="13:169">
        Transaction Data
      </p>
      <p className="layer-478" data-node-id="13:170">
        SiliconFlow enterprise allocation workspace
      </p>
      <p className="layer-571" data-node-id="13:171">
        Demand and Supply CSV upload templates
      </p>
      <div className="layer-572" data-node-id="13:172" data-name="Panel" />
      <p className="layer-573" data-node-id="13:173">
        Demand CSV
      </p>
      <PrototypeUpload type="demand" className="layer-574" />
      <PrototypeText value="demand-columns" className="layer-575" data-node-id="13:175">
        customer_id, product_id, requested_week, quantity
      </PrototypeText>
      <div className="layer-576" data-node-id="13:176" data-name="Panel" />
      <p className="layer-577" data-node-id="13:177">
        Supply CSV
      </p>
      <PrototypeUpload type="supply" className="layer-578" />
      <PrototypeText value="supply-columns" className="layer-579" data-node-id="13:179">
        product_id, location_id, available_week, quantity
      </PrototypeText>
      <PrototypeAction action="Button / Continue to Allocation Engine" className="layer-580" data-node-id="13:180" data-name="Button / Continue to Allocation Engine">
        <p className="layer-186" data-node-id="13:181">{`Continue to Allocation Engine  →`}</p>
        <div className="layer-187" data-node-id="2031:452" data-name="Semiconductor icon / GO" />
        <div className="layer-188" data-node-id="4008:174" data-name="Premium functional vector" />
        <div className="layer-189" data-node-id="4008:175" data-name="Premium functional vector" />
        <div className="layer-190" data-node-id="4008:176" data-name="Premium functional vector" />
      </PrototypeAction>
      <div className="layer-482" data-node-id="13:189" data-name="Content divider" />
      <div className="layer-483" data-node-id="13:191" data-name="User avatar" />
      <p className="layer-484" data-node-id="13:192">
        K
      </p>
      <PrototypeAction action="Expand sidebar" className="layer-485" data-node-id="13:193" data-name="Expand sidebar">
        <p className="layer-486" data-node-id="13:194">
          »
        </p>
      </PrototypeAction>
      <PrototypeAction action="Switch Role" className="layer-487" data-node-id="13:196" data-name="Switch Role">
        <p className="layer-488" data-node-id="13:197">
          Plan
        </p>
      </PrototypeAction>
      <div className="layer-489" data-node-id="2010:47" data-name="Premium / accent line" />
      <div className="layer-490" data-node-id="2010:48" data-name="Premium / header signal" />
      <p className="layer-491" data-node-id="2010:49">
        SEMICONDUCTOR SUPPLY INTELLIGENCE
      </p>
      <div className="layer-581" data-node-id="2031:432" data-name="Semiconductor icon / DEM" />
      <div className="layer-582" data-node-id="2031:442" data-name="Semiconductor icon / SUP" />
      <div className="layer-583" data-node-id="4008:177" data-name="Premium functional vector" />
      <div className="layer-584" data-node-id="4008:178" data-name="Premium functional vector" />
      <div className="layer-585" data-node-id="4008:179" data-name="Premium functional vector" />
      <div className="layer-586" data-node-id="4008:180" data-name="Premium functional vector" />
      <div className="layer-587" data-node-id="4008:181" data-name="Premium functional vector" />
      <div className="layer-588" data-node-id="4008:182" data-name="Premium functional vector" />
    </div>
  );
}
