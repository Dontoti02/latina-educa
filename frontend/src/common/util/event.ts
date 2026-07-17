import { ref } from "vue";

type EventMap = {
  'reload-credentials': {
    domain:string
    subdomain:string
    url : string
  };
};

type EventKey = keyof EventMap;
type EventCallback<T> = (args: T) => void;

const bus = ref(new Map<EventKey, EventCallback<any>>());

export default function useEventsBus() {
    function emit<K extends EventKey>(event: K, args: EventMap[K]) {
        const callback = bus.value.get(event) as EventCallback<EventMap[K]>;
        if (callback) {
            callback(args);
        }
    }

    function on<K extends EventKey>(event: K, callback: EventCallback<EventMap[K]>) {
        bus.value.set(event, callback);
    }

    return {
        emit,
        on,
        bus
    }
}
