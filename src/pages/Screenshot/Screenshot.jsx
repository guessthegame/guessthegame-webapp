import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import screenshotActions from '../../actions/screenshotActions';
import helperService from '../../services/helperService';
import Loading from '../../components/Loading/Loading';
import './screenshot.css';

function mapStoreToProps(store) {
  return {
    screenshot: store.screenshot,
    isTryAnotherButtonClicked: store.screenshot.isTryAnotherButtonClicked,
    allSolved: store.screenshot.allSolved,
    isGuessing: store.screenshot.isGuessing,
    isLoading: store.screenshot.isLoading,
    isProposalRight: store.screenshot.isProposalRight,
    isProposalWrong: store.screenshot.isProposalWrong,
    error: store.screenshot.error,
    lastViewedRandomScreenshots: store.user.lastViewedRandomScreenshots,
  };
}
class ScreenshotPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      proposal: '',
    };
    this.guessInputRef = React.createRef();
    this.touch = null;

    if (Number(props.match.params.id) !== props.screenshot.id) {
      this.props.dispatch(
        screenshotActions.loadScreenshot(props.match.params.id)
      );
    }
  }

  componentDidUpdate() {
    if (this.props.isLoading) {
      return;
    }
    if (
      !this.props.error &&
      Number(this.props.match.params.id) !== this.props.screenshot.id
    ) {
      this.props.dispatch(
        screenshotActions.loadScreenshot(this.props.match.params.id)
      );
    }
  }

  handleChangeProposal = event => {
    this.props.dispatch(screenshotActions.resetGuess());
    this.setState({
      proposal: event.target.value,
    });
  };

  trySubmitHandler = event => {
    event.preventDefault();
    this.guessInputRef.current.focus();
    if (this.props.isProposalRight || !this.state.proposal.trim()) {
      return;
    }
    this.props.dispatch(
      screenshotActions.tryProposal(
        this.props.screenshot.id,
        this.state.proposal
      )
    );
  };

  handleTryAnother = () => {
    this.setState({ proposal: '' });
    this.props.dispatch(
      screenshotActions.getUnsolvedScreenshot(
        this.props.lastViewedRandomScreenshots
      )
    );
  };

  handleRemoveOwn = () => {
    if (!window.confirm('Are you sure to remove this screenshot?')) {
      return;
    }
    const { screenshot } = this.props;
    this.props.dispatch(screenshotActions.removeOwnScreenshot(screenshot.id));
  };

  renderScreenshotBox = () => {
    const {
      screenshot,
      isTryAnotherButtonClicked,
      isProposalRight,
    } = this.props;
    const isLoading = screenshot.isLoading || isTryAnotherButtonClicked;
    return (
      <div>
        {this.renderHeader()}
        <div
          className={`ScreenshotPage_screenshot ${
            screenshot.isSolved || isProposalRight ? '-success' : ''
          }`}
        >
          <div
            className="ScreenshotPage_screenshot_image"
            style={{
              backgroundImage: isLoading ? '' : `url(${screenshot.url})`,
            }}
          />
          <div className="ScreenshotPage_screenshot_success_banner">
            <p className="ScreenshotPage_screenshot_success_banner_text">
              RESOLU !
            </p>
            <p className="ScreenshotPage_screenshot_success_banner_gameName">
              {screenshot.name}
              {screenshot.year ? ` (${screenshot.year})` : null}
            </p>
          </div>
        </div>
        <div className="ScreenshotPage_footer">{this.renderFooter()}</div>
      </div>
    );
  };

  renderHeader = () => {
    const { screenshot, isProposalRight, error } = this.props;
    if (error) {
      return (
        <div className="ScreenshotPage_header">
          <p className="ScreenshotPage_header_error">{error}</p>
        </div>
      );
    }
    return (
      <div className="ScreenshotPage_header">
        <div
          className={
            screenshot.approvalStatus === 1 ? 'ScreenshotPage_header_left' : ''
          }
        >
          <h1
            className={`ScreenshotPage_header_title ${
              screenshot.isSolved || isProposalRight ? '-isSolved' : ''
            }`}
          >
            {screenshot.prevScreenshotId ? (
              <Link
                to={`/screen/${screenshot.prevScreenshotId}`}
                className="ScreenshotPage_prevNext_link -prev"
              >
                ‹
              </Link>
            ) : (
              <span className="ScreenshotPage_prevNext_link -prev -disabled">
                ‹
              </span>
            )}
            #{screenshot.id}
            {screenshot.nextScreenshotId ? (
              <Link
                to={`/screen/${screenshot.nextScreenshotId}`}
                className="ScreenshotPage_prevNext_link -next"
              >
                ›
              </Link>
            ) : (
              <span className="ScreenshotPage_prevNext_link -next -disabled">
                ›
              </span>
            )}{' '}
            <ApprovalStatus approvalStatus={screenshot.approvalStatus} />
          </h1>
          <div className="column ScreenshotPage_header_uploadedBy">
            Par <b>{screenshot.isOwn ? 'you! — ' : screenshot.addedBy}</b>
            {screenshot.isOwn ? (
              <button
                className="ScreenshotPage_header_removeScreenshotLink"
                onClick={this.handleRemoveOwn}
              >
                ✖ Supprimer
                <span className="ScreenshotPage_header_removeScreenshotLink_hideMobile">
                  {' '}
                  le screen
                </span>
              </button>
            ) : null}
          </div>
        </div>
        {screenshot.approvalStatus === 1 ? (
          <div className="ScreenshotPage_header_right">
            {screenshot.stats.solvedCount ? (
              <p className="ScreenshotPage_header_solvedByCount">
                Résolu par {screenshot.stats.solvedCount} personne{screenshot
                  .stats.solvedCount >= 2
                  ? 's'
                  : null}
              </p>
            ) : null}
            <p className="ScreenshotPage_header_firstSolvedBy">
              {screenshot.stats.firstSolvedBy ? (
                <span>
                  Premier·ère à trouver :{' '}
                  <b>{screenshot.stats.firstSolvedBy}</b>
                </span>
              ) : (
                'Soyez le premier ou la première à trouver !'
              )}
            </p>
          </div>
        ) : null}
      </div>
    );
  };

  renderFooter = () => {
    const {
      screenshot,
      isProposalRight,
      isProposalWrong,
      isGuessing,
      error,
    } = this.props;
    return (
      <div>
        <div className="ScreenshotPage_prevNext">
          {screenshot.nextScreenshotId ? (
            <Link
              to={`/screen/${screenshot.nextScreenshotId}`}
              className="ScreenshotPage_prevNext_link -next"
            >
              <span className="-hideOnSmartphones">Screen</span> suivante &gt;
            </Link>
          ) : null}
        </div>
        <form className="ScreenshotPage_form" onSubmit={this.trySubmitHandler}>
          <div className="ScreenshotPage_form_col" />
          <div className="ScreenshotPage_form_col">
            {screenshot.isSolved ? (
              <p>
                Vous avez résolu ce screen le{' '}
                {helperService.formatDate(screenshot.solvedAt)}
              </p>
            ) : null}
            {screenshot.isOwn ? (
              <p>
                Vous avez ajouté ce screen le{' '}
                {helperService.formatDate(screenshot.createdAt)}
              </p>
            ) : null}
            {screenshot.approvalStatus === 0 ? (
              <p>
                Ce screen est <b>en attente de validation</b>.
              </p>
            ) : null}
            {screenshot.approvalStatus === -1 ? (
              <p>
                Ce screen a été <b>rejeté</b> par les modérateurs.
              </p>
            ) : null}
            {!error &&
            !screenshot.isSolved &&
            !screenshot.isOwn &&
            screenshot.approvalStatus === 1 ? (
              <div
                className={`ScreenshotPage_form_input 
            ${isGuessing ? '-guessing' : ''}
            ${isProposalRight ? '-success' : ''}
            ${isProposalWrong ? '-error' : ''}
          `}
              >
                <input
                  ref={this.guessInputRef}
                  className="ScreenshotPage_form_input_text"
                  type="text"
                  placeholder="Quel est ce jeu ?"
                  value={this.state.proposal}
                  onChange={this.handleChangeProposal}
                />
                <button
                  className="ScreenshotPage_form_input_valid"
                  type="submit"
                  disabled={isGuessing}
                >
                  {isGuessing ? (
                    <Loading />
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
                    </svg>
                  )}
                </button>
              </div>
            ) : null}
          </div>
          <p className="ScreenshotPage_form_or -onlyOnSmartphones">ou</p>
          <div className="ScreenshotPage_form_col -col3">
            <button
              type="button"
              className={`ScreenshotPage_form_next ${
                this.props.isTryAnotherButtonClicked ? '-isLoading' : ''
              }`}
              disabled={this.props.isTryAnotherButtonClicked}
              onClick={this.handleTryAnother}
            >
              Une autre&nbsp;!
              <span className="ScreenshotPage_form_next_icon">
                <img
                  className="ScreenshotPage_form_next_icon-1"
                  src="/icons/random-1.svg"
                  alt="next"
                />
                <img
                  className="ScreenshotPage_form_next_icon-2"
                  src="/icons/random-2.svg"
                  alt="screenshot"
                />
              </span>
            </button>
          </div>
        </form>
      </div>
    );
  };

  render = () => (
    <section>
      <Helmet title={`Shot #${this.props.screenshot.id}`} />
      <div className="ScreenshotPage">{this.renderScreenshotBox()}</div>
    </section>
  );
}
export default connect(mapStoreToProps)(ScreenshotPage);

function ApprovalStatus({ approvalStatus }) {
  if (approvalStatus === 0) {
    return (
      <span className="Screenshot_ApprovalStatus -awaiting">
        {' '}
        - En attente de validation
      </span>
    );
  }
  if (approvalStatus === -1) {
    return (
      <span className="Screenshot_ApprovalStatus -rejected"> - Rejete</span>
    );
  }
  return null;
}
