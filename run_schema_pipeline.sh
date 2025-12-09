#!/bin/bash

# Schema Pipeline Runner
# Executes all schema generation and validation steps in the correct order
# with error checking and progress reporting

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
START_TIME=$(date +%s)

# Arrays to track execution
declare -a EXECUTED_STEPS=()
declare -a FAILED_STEPS=()
declare -a STEP_TIMES=()

# Function to print colored output
print_header() {
    echo -e "\n${BOLD}${CYAN}════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${CYAN}$1${NC}"
    echo -e "${BOLD}${CYAN}════════════════════════════════════════════════════════════════════${NC}\n"
}

print_step() {
    echo -e "${BOLD}${BLUE}▶ Step $1: $2${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Function to format duration
format_duration() {
    local seconds=$1
    if [ $seconds -lt 60 ]; then
        echo "${seconds}s"
    else
        local minutes=$((seconds / 60))
        local remaining_seconds=$((seconds % 60))
        echo "${minutes}m ${remaining_seconds}s"
    fi
}

# Function to execute npm script with error checking
execute_step() {
    local step_num=$1
    local step_name=$2
    local npm_script=$3
    local description=$4
    
    print_step "$step_num" "$description"
    echo -e "   ${CYAN}Command: npm run $npm_script${NC}\n"
    
    local step_start=$(date +%s)
    
    # Execute the npm script
    npm run "$npm_script"
    local exit_code=$?
    
    local step_end=$(date +%s)
    local step_duration=$((step_end - step_start))
    STEP_TIMES+=("$step_duration")
    
    # Check exit code
    if [ $exit_code -eq 0 ]; then
        print_success "Step $step_num completed successfully ($(format_duration $step_duration))"
        EXECUTED_STEPS+=("$step_name")
        return 0
    else
        print_error "Step $step_num failed with exit code $exit_code"
        FAILED_STEPS+=("$step_name")
        return 1
    fi
}

# Main execution
main() {
    print_header "🚀 Schema Pipeline Runner"
    
    echo -e "${BOLD}Pipeline Steps:${NC}"
    echo -e "  1. Test public examples"
    echo -e "  2. Generate full schemas"
    echo -e "  3. Generate Lucide icons"
    echo -e "  4. Generate stripped examples"
    echo -e "  5. Generate full examples"
    echo -e "  6. Push schemas to agent"
    echo ""
    
    # Change to script directory
    cd "$SCRIPT_DIR" || {
        print_error "Failed to change to script directory"
        exit 1
    }
    
    print_info "Working directory: $SCRIPT_DIR"
    echo ""
    
    # Step 1: Test public examples
    execute_step 1 "test:public_examples" "test:public_examples" "Testing public examples validation"
    if [ $? -ne 0 ]; then
        print_error "Pipeline aborted: Public examples validation failed"
        print_warning "Please fix validation errors before continuing"
        exit 1
    fi
    
    echo ""
    
    # Step 2: Generate full schemas
    execute_step 2 "gen:schemas:full" "gen:schemas:full" "Generating full schema catalog"
    if [ $? -ne 0 ]; then
        print_error "Pipeline aborted: Full schema generation failed"
        exit 1
    fi
    
    echo ""
    
    # Step 3: Generate Lucide icons
    execute_step 3 "gen:icons:lucide" "gen:icons:lucide" "Generating Lucide icons list"
    if [ $? -ne 0 ]; then
        print_error "Pipeline aborted: Lucide icons generation failed"
        exit 1
    fi
    
    echo ""
    
    # Step 4: Generate stripped examples
    execute_step 4 "gen:schemas:examples:stripped" "gen:schemas:examples:stripped" "Generating examples (stripped mode)"
    if [ $? -ne 0 ]; then
        print_error "Pipeline aborted: Stripped examples generation failed"
        exit 1
    fi
    
    echo ""
    
    # Step 5: Generate full examples
    execute_step 5 "gen:schemas:examples" "gen:schemas:examples" "Generating examples (full mode)"
    if [ $? -ne 0 ]; then
        print_error "Pipeline aborted: Full examples generation failed"
        exit 1
    fi
    
    echo ""
    
    # Step 6: Push schemas
    execute_step 6 "gen:schemas:push" "gen:schemas:push" "Pushing schemas to agent directory"
    if [ $? -ne 0 ]; then
        print_error "Pipeline aborted: Schema push failed"
        exit 1
    fi
    
    # Calculate total time
    local end_time=$(date +%s)
    local total_duration=$((end_time - START_TIME))
    
    # Print final report
    print_header "📊 Pipeline Execution Report"
    
    echo -e "${BOLD}Execution Summary:${NC}"
    echo -e "  Total Steps: 6"
    echo -e "  ${GREEN}Completed: ${#EXECUTED_STEPS[@]}${NC}"
    echo -e "  ${RED}Failed: ${#FAILED_STEPS[@]}${NC}"
    echo -e "  Total Time: $(format_duration $total_duration)"
    echo ""
    
    if [ ${#FAILED_STEPS[@]} -eq 0 ]; then
        echo -e "${BOLD}${GREEN}✅ All pipeline steps completed successfully!${NC}\n"
        
        echo -e "${BOLD}Step Timings:${NC}"
        echo -e "  1. test:public_examples          : $(format_duration ${STEP_TIMES[0]})"
        echo -e "  2. gen:schemas:full              : $(format_duration ${STEP_TIMES[1]})"
        echo -e "  3. gen:icons:lucide              : $(format_duration ${STEP_TIMES[2]})"
        echo -e "  4. gen:schemas:examples:stripped : $(format_duration ${STEP_TIMES[3]})"
        echo -e "  5. gen:schemas:examples          : $(format_duration ${STEP_TIMES[4]})"
        echo -e "  6. gen:schemas:push              : $(format_duration ${STEP_TIMES[5]})"
        echo ""
        
        print_info "Schemas are ready and pushed to the agent directory"
        print_info "You can now use the updated schemas in your application"
        
        exit 0
    else
        echo -e "${BOLD}${RED}❌ Pipeline completed with errors${NC}\n"
        
        echo -e "${BOLD}Failed Steps:${NC}"
        for step in "${FAILED_STEPS[@]}"; do
            echo -e "  ${RED}✗${NC} $step"
        done
        echo ""
        
        print_warning "Please review the errors above and fix them before running again"
        
        exit 1
    fi
}

# Trap errors
set -E
trap 'print_error "An unexpected error occurred at line $LINENO"' ERR

# Run main function
main "$@"

