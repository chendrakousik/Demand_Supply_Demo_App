import { PrototypeAction, PrototypeUpload, PrototypeText } from '../prototype-action.js'

export default function SiliconFlowV2TransactionData() {
  return (
    <div className="layer-44" data-node-id="1:97" data-name="SiliconFlow V2 / Transaction Data">
      <div className="layer-45" data-node-id="5:29" data-name="Sidebar / Deep navy" />
      <div className="layer-46" data-node-id="19:4" data-name="Sidebar / Brand header backdrop" />
      <div className="layer-4" data-node-id="1:99" data-name="Logo mark" />
      <PrototypeAction action="Nav / Home" className="layer-47" data-node-id="1:106" data-name="Nav / Home">
        <p className="layer-48" data-node-id="1:107">{`⌂  Home`}</p>
      </PrototypeAction>
      <PrototypeAction action="Nav / Data Management" className="layer-97" data-node-id="1:108" data-name="Nav / Data Management">
        <p className="layer-52" data-node-id="1:109">
          Data Management
        </p>
      </PrototypeAction>
      <PrototypeAction action="Nav / Master Data" className="layer-51" data-node-id="1:110" data-name="Nav / Master Data">
        <p className="layer-52" data-node-id="1:111">
          Master Data
        </p>
      </PrototypeAction>
      <div className="layer-175" data-node-id="1:112" data-name="Nav / Transaction Data">
        <p className="layer-50" data-node-id="1:113">
          Transaction Data
        </p>
      </div>
      <p className="layer-54" data-node-id="1:114">
        TRANSACTION DATA
      </p>
      <p className="layer-55" data-node-id="1:115">
        Transaction Data
      </p>
      <p className="layer-56" data-node-id="1:116">
        SiliconFlow enterprise allocation workspace
      </p>
      <p className="layer-176" data-node-id="1:117">
        Demand and Supply CSV upload templates
      </p>
      <div className="layer-177" data-node-id="1:118" data-name="Panel" />
      <p className="layer-178" data-node-id="1:119">
        Demand CSV
      </p>
      <PrototypeUpload type="demand" className="layer-179" />
      <PrototypeText value="demand-columns" className="layer-180" data-node-id="1:121">
        customer_id, product_id, requested_week, quantity
      </PrototypeText>
      <div className="layer-181" data-node-id="1:122" data-name="Panel" />
      <p className="layer-182" data-node-id="1:123">
        Supply CSV
      </p>
      <PrototypeUpload type="supply" className="layer-183" />
      <PrototypeText value="supply-columns" className="layer-184" data-node-id="1:125">
        product_id, location_id, available_week, quantity
      </PrototypeText>
      <PrototypeAction action="Button / Continue to Allocation Engine" className="layer-185" data-node-id="1:126" data-name="Button / Continue to Allocation Engine">
        <p className="layer-186" data-node-id="1:127">{`Continue to Allocation Engine  →`}</p>
        <div className="layer-187" data-node-id="2031:102" data-name="Semiconductor icon / GO" />
        <div className="layer-188" data-node-id="4008:37" data-name="Premium functional vector" />
        <div className="layer-189" data-node-id="4008:38" data-name="Premium functional vector" />
        <div className="layer-190" data-node-id="4008:39" data-name="Premium functional vector" />
      </PrototypeAction>
      <div className="layer-78" data-node-id="5:34" data-name="Side footer" />
      <p className="layer-79" data-node-id="5:35">
        PLANNING ENVIRONMENT
      </p>
      <p className="layer-80" data-node-id="5:36">{`OCT 2026  •  W43`}</p>
      <div className="layer-81" data-node-id="5:37" data-name="Content divider" />
      <div className="layer-82" data-node-id="5:39" data-name="User avatar" />
      <p className="layer-83" data-node-id="5:40">
        K
      </p>
      <PrototypeAction action="Collapse sidebar" className="layer-84" data-node-id="13:199" data-name="Collapse sidebar">
        <p className="layer-85" data-node-id="13:200">
          «
        </p>
      </PrototypeAction>
      <PrototypeAction action="Select role" className="layer-86" data-node-id="13:202" data-name="Select role">
        <PrototypeText value="role" className="layer-87" data-node-id="13:203">
          Planner ▾
        </PrototypeText>
      </PrototypeAction>
      <div className="layer-88" data-node-id="5:30" data-name="Brand mark" />
      <p className="layer-89" data-node-id="5:31">
        S
      </p>
      <p className="layer-90" data-node-id="5:32">
        SILICONFLOW
      </p>
      <p className="layer-91" data-node-id="5:33">
        ALLOCATION INTELLIGENCE
      </p>
      <div className="layer-92" data-node-id="2010:10" data-name="Premium / accent line" />
      <div className="layer-93" data-node-id="2010:11" data-name="Premium / header signal" />
      <p className="layer-94" data-node-id="2010:12">
        SEMICONDUCTOR SUPPLY INTELLIGENCE
      </p>
      <div className="layer-191" data-node-id="2031:82" data-name="Semiconductor icon / DEM" />
      <div className="layer-192" data-node-id="2031:92" data-name="Semiconductor icon / SUP" />
      <div className="layer-193" data-node-id="4008:40" data-name="Premium functional vector" />
      <div className="layer-194" data-node-id="4008:41" data-name="Premium functional vector" />
      <div className="layer-195" data-node-id="4008:42" data-name="Premium functional vector" />
      <div className="layer-196" data-node-id="4008:43" data-name="Premium functional vector" />
      <div className="layer-197" data-node-id="4008:44" data-name="Premium functional vector" />
      <div className="layer-198" data-node-id="4008:45" data-name="Premium functional vector" />
    </div>
  );
}
