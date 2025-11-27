# core/management/commands/cron_sync.py
from django.core.management.base import BaseCommand
from core.services import run_smart_sync

class Command(BaseCommand):
    help = 'Chạy job đồng bộ giao dịch thông minh'

    def handle(self, *args, **kwargs):
        self.stdout.write("Bắt đầu Job Smart Sync...")
        run_smart_sync()
        self.stdout.write("Hoàn tất.")