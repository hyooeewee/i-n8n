
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { authClient } from "@/lib/auth-client";

interface UpgradeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}
const UpgradeModal = ({ isOpen, onOpenChange }: UpgradeModalProps) => {
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Upgrade to Pro</AlertDialogTitle>
          <AlertDialogDescription>
            You need a active subscription to perform this action. Upgrade to
            Pro to unlock all features.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              authClient.checkout({ slug: "pro" });
            }}
          >
            Upgrade Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UpgradeModal;
