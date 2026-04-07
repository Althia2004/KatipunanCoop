<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class AnnualReportsController extends Controller
{
    public function index()
    {
        return Inertia::render('AnnualMeetingReports/index', []);
    }
}
