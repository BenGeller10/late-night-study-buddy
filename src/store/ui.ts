// Simple toast state without external dependencies
interface ToastState {
  open: boolean;
  message: string;
}

class UIStore {
  private state: { toast: ToastState } = {
    toast: { open: false, message: '' }
  };
  
  private listeners: (() => void)[] = [];

  getState() {
    return this.state;
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }

  openToast(message: string) {
    this.state = { toast: { open: true, message } };
    this.listeners.forEach(listener => listener());
  }

  closeToast() {
    this.state = { toast: { open: false, message: '' } };
    this.listeners.forEach(listener => listener());
  }
}

export const uiStore = new UIStore();