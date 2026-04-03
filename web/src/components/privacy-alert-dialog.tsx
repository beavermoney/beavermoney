import { EyeOffIcon } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface PrivacyAlertDialogProps {
  open: boolean
  onPrivacyChoice: (enablePrivacy: boolean) => void
}

export function PrivacyAlertDialog({
  open,
  onPrivacyChoice,
}: PrivacyAlertDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={() => {
        // Prevent dismissal - user must make a choice
      }}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <EyeOffIcon className="text-muted-foreground" />
          </AlertDialogMedia>
          <AlertDialogTitle>Privacy Mode</AlertDialogTitle>
          <AlertDialogDescription>
            Protect your financial data in public spaces? Privacy mode will hide
            all amounts and sensitive information.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onPrivacyChoice(false)}>
            No, I'm in private
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => onPrivacyChoice(true)}>
            Yes, I'm in public
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
