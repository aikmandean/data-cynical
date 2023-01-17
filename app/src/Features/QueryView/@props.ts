import { declareProps } from "@hwyblvd/st";
import { useRef } from "../../xlib/Ref";

export const [portalRaw, portalWhere, portalFrom] = useRef();

export const { SetShowEdit, SetShowGrouping, ShowEdit, ShowGrouping, ShowNewTable } = declareProps({
    showEdit: false,
    showGrouping: false,
    setShowGrouping: (x: (b: boolean) => any) => {},
    setShowEdit: (x: (b: boolean) => any) => {},
    showNewTable: () => {}
});