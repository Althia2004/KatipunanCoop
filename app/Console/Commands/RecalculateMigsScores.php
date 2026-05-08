<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\MigsScoreService;
use App\Models\Member;

class RecalculateMigsScores extends Command
{
    protected $signature   = 'migs:recalculate {--member= : Recalculate for a specific member ID}';
    protected $description = 'Recalculate MIGS scores for all members or a specific member';

    public function handle(MigsScoreService $service): void
    {
        if ($memberId = $this->option('member')) {
            $member = Member::findOrFail($memberId);
            $updated = $service->recalculate($member);
            $this->info("Member #{$memberId}: Score = {$updated->migs_score} ({$updated->migs_classification})");
            return;
        }

        $members = Member::all();
        $bar = $this->output->createProgressBar($members->count());
        $bar->start();

        $members->each(function ($member) use ($service, $bar) {
            $service->recalculate($member);
            $bar->advance();
        });

        $bar->finish();
        $this->newLine();
        $this->info("MIGS scores recalculated for {$members->count()} member(s).");
    }
}
